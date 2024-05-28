package com.vscode4teaching.vscode4teachingserver.security.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.servlet.http.HttpServletRequest;
import java.io.Serializable;
import java.security.Key;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JWTTokenUtil implements Serializable {
    private static final long serialVersionUID = 4564116581L;
    private static final long JWT_TOKEN_VALIDITY = 5 * 60 * 60 * 1000L;

    // Value in application.properties
    @Value("${jwt.secret}")
    private String secret;

    private Key key;

    private Claims getAllClaimsFromToken(String token) {
        return Jwts.parser().setSigningKey(secret).parseClaimsJws(token).getBody();
    }

    public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = getAllClaimsFromToken(token);
        return claimsResolver.apply(claims);
    }

    public String getUsernameFromToken(String token) {
        return getClaimFromToken(token, Claims::getSubject);
    }

    public Date getExpirationDateFromToken(String token) {
        return getClaimFromToken(token, Claims::getExpiration);
    }

    private Boolean isTokenExpired(String token) {
        final Date expiration = getExpirationDateFromToken(token);
        return expiration.before(new Date());
    }

    public String generateToken(UserDetails userDetails) {
        return buildToken(new HashMap<>(), userDetails.getUsername());
    }

    private String buildToken(Map<String, Object> claims, String subject) {
        return Jwts.builder().setClaims(claims).setSubject(subject).setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + JWT_TOKEN_VALIDITY))
                .signWith(SignatureAlgorithm.HS512, secret).compact();
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = getUsernameFromToken(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    public String getCleanTokenFromRequest(HttpServletRequest request) {
        // Check header for token
        String jwtToken = request.getHeader("Authorization");
        if (jwtToken == null) {
            jwtToken = request.getHeader("Encrypted-Authorization");
        }
        if (jwtToken != null) {
            if (jwtToken.startsWith("Bearer ")) {
                jwtToken = jwtToken.substring(7);
            }
            if (request.getHeader("Encrypted-Authorization") != null) {
                jwtToken = decryptToken(jwtToken);
            }
        }

        // If token is not in header, check query string
        if (jwtToken == null) {
            jwtToken = request.getParameter("bearer");
            if (request.getParameter("encrypted-bearer") != null) {
                jwtToken = decryptToken(request.getParameter("encrypted-bearer"));
            }
        }
        return jwtToken;
    }

    public String getUsernameFromAuthenticatedRequest(HttpServletRequest request) {
        String jwtToken = getCleanTokenFromRequest(request);
        return (jwtToken == null) ? null : getUsernameFromToken(jwtToken);
    }

    public String encryptToken(String text) {
        try {
            Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
            cipher.init(Cipher.ENCRYPT_MODE, this.getAESKey());

            byte[] encrypted = cipher.doFinal(text.getBytes());

            return Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception e) {
            return "";
        }
    }

    public String decryptToken(String encrypted) {
        byte[] encryptedBytes = Base64.getDecoder().decode(encrypted.replace("\n", ""));

        try {
            Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
            cipher.init(Cipher.DECRYPT_MODE, this.getAESKey());

            return new String(cipher.doFinal(encryptedBytes));
        } catch (Exception e) {
            return "";
        }
    }

    private Key getAESKey() {
        if (this.key == null) {
            try {
                KeyGenerator generator = KeyGenerator.getInstance("AES");
                this.key = generator.generateKey();
            } catch (Exception e) {
                return null;
            }
        }
        return this.key;
    }
}