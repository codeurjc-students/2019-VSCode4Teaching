import * as assert from 'assert';
import { APIClient } from '../../src/client/APIClient';
import * as path from 'path';
import * as fs from 'fs';
import * as rimraf from 'rimraf';
import * as mkdirp from 'mkdirp';

afterEach(() => {
    APIClient.invalidateSession();
    let v4tPath = path.resolve(__dirname, '..', '..', 'src', 'v4t');
    if (fs.existsSync(v4tPath)) {
        rimraf(v4tPath, ((error) => {
            // console.error(error);
        }));
    }

});

// test('loginV4T', async () => {
//     let username = 'johndoe';
//     let password = 'password';
//     let url = 'http://localhost:8080';
//     APIClient.loginV4T(username, password, url);

// });

test('invalidateSession', () => {
    APIClient.baseUrl = 'http://wrongurl.com:8080';
    APIClient.jwtToken = 'testToken';
    APIClient.xsrfToken = 'testToken';
    if (!fs.existsSync(APIClient.sessionPath)) {
        let sessionDir = path.resolve(APIClient.sessionPath, '..');
        if (!fs.existsSync(sessionDir)) {
            mkdirp.sync(sessionDir);
        }
        fs.writeFileSync(APIClient.sessionPath, 'testToken\ntestToken\nhttp://wrongurl.com:8080');
    }
    APIClient.invalidateSession();
    assert.deepStrictEqual(APIClient.baseUrl, undefined, "base url didn't reset");
    assert.deepStrictEqual(APIClient.jwtToken, undefined, "base url didn't reset");
    assert.deepStrictEqual(APIClient.xsrfToken, "", "base url didn't reset");
    assert.deepStrictEqual(fs.existsSync(APIClient.sessionPath), false, "session file should be deleted");
});