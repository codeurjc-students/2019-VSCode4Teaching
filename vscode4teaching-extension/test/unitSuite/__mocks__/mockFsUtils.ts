import * as fs from "fs";

export const mockFsStatus = (isDirectory: boolean) => ({
    isFile: jest.fn(),
    isDirectory: jest.fn().mockReturnValue(isDirectory),
    isBlockDevice: jest.fn(),
    isCharacterDevice: jest.fn(),
    isSymbolicLink: jest.fn(),
    isFIFO: jest.fn(),
    isSocket: jest.fn(),
    dev: 2051,
    mode: 16893,
    nlink: 4,
    uid: 1000,
    gid: 1000,
    rdev: 0,
    blksize: 4096,
    ino: 2623964,
    size: 4096,
    blocks: 8,
    atimeMs: 1,
    mtimeMs: 1,
    ctimeMs: 1,
    birthtimeMs: 1,
    atime: new Date(),
    mtime: new Date(),
    ctime: new Date(),
    birthtime: new Date()
});

export const mockFsDirent = (name: string, isDirectory: boolean) => ({
    name,
    isBlockDevice: jest.fn(),
    isCharacterDevice: jest.fn(),
    isDirectory: jest.fn().mockReturnValue(isDirectory),
    isFIFO: jest.fn(),
    isFile: jest.fn(),
    isSocket: jest.fn(),
    isSymbolicLink: jest.fn()
});