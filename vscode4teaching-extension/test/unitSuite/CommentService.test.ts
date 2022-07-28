import { AxiosResponse } from "axios";
import * as path from "path";
import { mocked } from "ts-jest/utils";
import * as vscode from "vscode";
import { APIClient } from "../../src/client/APIClient";
import { ServerCommentThread } from "../../src/model/serverModel/comment/ServerCommentThread";
import { FileInfo } from "../../src/model/serverModel/file/FileInfo";
import { NoteComment } from "../../src/services/NoteComment";
import { TeacherCommentService } from "../../src/services/TeacherCommentsService";

jest.mock("vscode");
const mockedVscode = mocked(vscode, true);
jest.mock("../../src/client/APIClient");
const mockedClient = mocked(APIClient, true);
jest.mock("path");
const mockedPath = mocked(path, true);

describe("Comment Service", () => {
    let commentProvider: TeacherCommentService;
    const author = "johndoe";

    beforeEach(() => {
        commentProvider = new TeacherCommentService(author);
    });

    afterEach(() => {
        mockedVscode.comments.createCommentController.mockClear();
        mockedVscode.workspace.openTextDocument.mockClear();
    });

    it("should create correctly", () => {
        expect(mockedVscode.comments.createCommentController).toHaveBeenCalledTimes(1);
        expect(mockedVscode.comments.createCommentController).toHaveBeenNthCalledWith(1, "teacherComments", "Teacher comments");

        expect(commentProvider.commentController.commentingRangeProvider?.provideCommentingRanges).toBeTruthy();
    });

    it("should add comment correctly", async () => {
        const line = 0;
        const positionMock: vscode.Position = {
            line,
            character: 0,
            compareTo: jest.fn(),
            isAfter: jest.fn(),
            isAfterOrEqual: jest.fn(),
            isBefore: jest.fn(),
            isBeforeOrEqual: jest.fn(),
            isEqual: jest.fn(),
            translate: jest.fn(),
            with: jest.fn(),
        };
        const rangeMock: vscode.Range = {
            start: positionMock,
            end: positionMock,
            contains: jest.fn(),
            intersection: jest.fn(),
            isEmpty: true,
            isEqual: jest.fn(),
            isSingleLine: true,
            union: jest.fn(),
            with: jest.fn(),
        };
        const lineText = "test";
        const student = "johndoejr";
        const commentText = [
            new vscode.MarkdownString("test"),
            new vscode.MarkdownString("test2"),
            new vscode.MarkdownString("new test"),
        ];
        const commentsMock: NoteComment[] = [
            new NoteComment(commentText[0], mockedVscode.CommentMode.Preview, { name: author }, lineText),
            new NoteComment(commentText[1], mockedVscode.CommentMode.Preview, { name: student }, lineText),
        ];
        const threadMock: vscode.CommentThread = {
            uri: mockedVscode.Uri.parse("testURL"),
            range: rangeMock,
            collapsibleState: mockedVscode.CommentThreadCollapsibleState.Expanded,
            comments: commentsMock,
            dispose: jest.fn(),
        };
        const replyMock: vscode.CommentReply = {
            thread: threadMock,
            text: commentText[2].value,
        };
        const textDocumentMock: vscode.TextDocument = {
            eol: mockedVscode.EndOfLine.LF,
            fileName: "test",
            getText: jest.fn(),
            getWordRangeAtPosition: jest.fn(),
            isClosed: false,
            isDirty: false,
            isUntitled: false,
            languageId: "json",
            lineAt: jest.fn().mockImplementation(() => {
                return {
                    firstNonWhitespaceCharacterIndex: 0,
                    isEmptyOrWhitespace: false,
                    lineNumber: line,
                    range: rangeMock,
                    rangeIncludingLineBreak: rangeMock,
                    text: lineText,
                };
            }),
            lineCount: 5,
            offsetAt: jest.fn(),
            positionAt: jest.fn(),
            save: jest.fn(),
            uri: threadMock.uri,
            validatePosition: jest.fn(),
            validateRange: jest.fn(),
            version: 1,
        };
        const fileId = 1;

        mockedVscode.workspace.openTextDocument.mockResolvedValueOnce(textDocumentMock);

        const savedCommentResponseData: ServerCommentThread = {
            line,
            lineText,
            comments: [
                {
                    author,
                    body: commentText[0].value,
                },
                {
                    author: student,
                    body: commentText[1].value,
                },
                {
                    author,
                    body: commentText[2].value,
                },
            ],
        };

        const savedCommentResponse: AxiosResponse<ServerCommentThread> = {
            data: Object.assign({ id: 10 }, savedCommentResponseData),
            status: 201,
            statusText: "",
            headers: {},
            config: {},
        };

        mockedClient.saveComment.mockResolvedValueOnce(savedCommentResponse);
        const errorCallback = jest.fn();

        await commentProvider.addComment(replyMock, fileId);
        expect(errorCallback).toHaveBeenCalledTimes(0);
        expect(threadMock.comments).toHaveLength(3);
        const addedComment = (threadMock.comments[2] as NoteComment);
        expect(addedComment.author).toStrictEqual({ name: author });
        if (typeof addedComment.body !== "string") {
            expect(addedComment.body.value).toBe(commentText[2].value);
        } else {
            fail("body of addedComment should be a vscode.MarkdownString instead of a primitive string");
        }
        expect(addedComment.lineText).toBe(lineText);
        expect(addedComment.mode).toBe(mockedVscode.CommentMode.Preview);
        expect(mockedClient.saveComment).toHaveBeenCalledTimes(1);
        expect(mockedClient.saveComment).toHaveBeenNthCalledWith(1, fileId, savedCommentResponseData);
    });

    it("should get thread correctly", async () => {
        const cwd = {
            uri: mockedVscode.Uri.parse("cwd"),
            index: 0,
            name: "Exercise",
        };
        const comments = [{
            line: 1,
            lineText: "line test",
            comments: [{
                author: "johndoe",
                body: "comment test",
            }, {
                author: "johndoejr",
                body: "comment test 2",
            }],
        }, {
            line: 3,
            lineText: "line test 2",
            comments: [{
                author: "johndoe",
                body: "comment test",
            }],
        }];
        const data: FileInfo[] = [{
            id: 10,
            path: "path test",
            comments,
        }];
        const commentsResponse: AxiosResponse<FileInfo[]> = {
            data,
            status: 200,
            statusText: "",
            headers: {},
            config: {},
        };
        mockedClient.getAllComments.mockResolvedValueOnce(commentsResponse);

        const positionMock1: vscode.Position = {
            line: comments[0].line,
            character: 0,
            compareTo: jest.fn(),
            isAfter: jest.fn(),
            isAfterOrEqual: jest.fn(),
            isBefore: jest.fn(),
            isBeforeOrEqual: jest.fn(),
            isEqual: jest.fn(),
            translate: jest.fn(),
            with: jest.fn(),
        };
        const rangeMock1: vscode.Range = {
            start: positionMock1,
            end: positionMock1,
            contains: jest.fn(),
            intersection: jest.fn(),
            isEmpty: true,
            isEqual: jest.fn(),
            isSingleLine: true,
            union: jest.fn(),
            with: jest.fn(),
        };
        const positionMock2: vscode.Position = {
            line: comments[1].line,
            character: 0,
            compareTo: jest.fn(),
            isAfter: jest.fn(),
            isAfterOrEqual: jest.fn(),
            isBefore: jest.fn(),
            isBeforeOrEqual: jest.fn(),
            isEqual: jest.fn(),
            translate: jest.fn(),
            with: jest.fn(),
        };
        const rangeMock2: vscode.Range = {
            start: positionMock2,
            end: positionMock2,
            contains: jest.fn(),
            intersection: jest.fn(),
            isEmpty: true,
            isEqual: jest.fn(),
            isSingleLine: true,
            union: jest.fn(),
            with: jest.fn(),
        };
        const textDocumentMock: vscode.TextDocument = {
            eol: mockedVscode.EndOfLine.LF,
            fileName: "test",
            getText: jest.fn(),
            getWordRangeAtPosition: jest.fn(),
            isClosed: false,
            isDirty: false,
            isUntitled: false,
            languageId: "json",
            lineAt: jest.fn().mockReturnValueOnce({
                firstNonWhitespaceCharacterIndex: 0,
                isEmptyOrWhitespace: false,
                lineNumber: comments[0].line,
                range: rangeMock1,
                rangeIncludingLineBreak: rangeMock1,
                text: comments[0].lineText,
            },
            ).mockReturnValueOnce({
                firstNonWhitespaceCharacterIndex: 0,
                isEmptyOrWhitespace: false,
                lineNumber: comments[1].line,
                range: rangeMock2,
                rangeIncludingLineBreak: rangeMock2,
                text: comments[1].lineText,
            },
            ),
            lineCount: 5,
            offsetAt: jest.fn(),
            positionAt: jest.fn(),
            save: jest.fn(),
            uri: mockedVscode.Uri.file("path test"),
            validatePosition: jest.fn(),
            validateRange: jest.fn(),
            version: 1,
        };
        mockedVscode.workspace.openTextDocument.mockResolvedValue(textDocumentMock);

        mockedPath.resolve.mockReturnValueOnce("path test");

        await commentProvider.getThreads(1, "johndoe", cwd, mockedClient.handleAxiosError);

        expect(mockedClient.getAllComments).toHaveBeenCalledTimes(1);
        expect(mockedClient.getAllComments).toHaveBeenNthCalledWith(1, "johndoe", 1);
        expect(mockedVscode.workspace.openTextDocument).toHaveBeenCalledTimes(1);
        expect(mockedVscode.workspace.openTextDocument).toHaveBeenNthCalledWith(1, mockedVscode.Uri.file("path test"));
        expect(commentProvider.commentController.createCommentThread).toHaveBeenCalledTimes(2);
        expect(mockedClient.handleAxiosError).toHaveBeenCalledTimes(0);
    });

    it("should update thread line", async () => {
        const threadId = 1;
        const line = 3;
        const lineText = "text";
        const positionMock: vscode.Position = {
            line,
            character: 0,
            compareTo: jest.fn(),
            isAfter: jest.fn(),
            isAfterOrEqual: jest.fn(),
            isBefore: jest.fn(),
            isBeforeOrEqual: jest.fn(),
            isEqual: jest.fn(),
            translate: jest.fn(),
            with: jest.fn(),
        };
        const rangeMock: vscode.Range = {
            start: positionMock,
            end: positionMock,
            contains: jest.fn(),
            intersection: jest.fn(),
            isEmpty: true,
            isEqual: jest.fn(),
            isSingleLine: true,
            union: jest.fn(),
            with: jest.fn(),
        };
        const response: AxiosResponse<ServerCommentThread> = {
            data: {
                line: 3,
                lineText: "text",
            },
            config: {},
            headers: {},
            status: 200,
            statusText: "",
        };
        mockedClient.updateCommentThreadLine.mockResolvedValueOnce(response);
        const thread = {
            dispose: jest.fn(),
            range: rangeMock,
            comments: [],
            uri: mockedVscode.Uri.file("file"),
            collapsibleState: mockedVscode.CommentThreadCollapsibleState.Collapsed,
        };
        commentProvider.setThread(threadId, thread);
        commentProvider.updateThreadLine(threadId, line, lineText);
        expect(mockedClient.updateCommentThreadLine).toHaveBeenCalledTimes(1);
        expect(mockedClient.updateCommentThreadLine).toHaveBeenNthCalledWith(1, threadId, line, lineText);
        expect(thread.range.start.line).toBe(line);
        expect(thread.range.start.character).toBe(0);
        expect(thread.range.end.line).toBe(line);
        expect(thread.range.end.character).toBe(0);
    });
});
