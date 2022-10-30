export const mockedPathJoin = (...chunks: string[]) => {
    let finalRoute = "";
    chunks.forEach(chunk =>
        finalRoute = finalRoute.concat(chunk).concat("/")
    );
    return finalRoute.slice(0, -1);
};