global.console = {
    // Keep native behaviour for other methods, use those to print out things in your own tests, not `console.log`
    log: jest.fn(), 
    error: console.error,
    warn: console.warn,
    info: console.info,
    debug: jest.fn(), // console.debug are ignored in tests
}