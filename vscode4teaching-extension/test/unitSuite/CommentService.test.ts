import { AxiosResponse } from "axios";
import { mocked } from "ts-jest/utils";
import * as vscode from "vscode";
import { APIClient } from "../../src/client/APIClient";
import { ServerCommentThread } from "../../src/model/serverModel/comment/ServerCommentThread";
import { NoteComment } from "../../src/services/NoteComment";
import { TeacherCommentService } from "../../src/services/TeacherCommentsService";

jest.mock("vscode");
const mockedVscode = mocked(vscode, true);
jest.mock("../../src/client/APIClient");
const mockedClient = mocked(APIClient, true);

describe("Comment Service", () => {
    let commentProvider: TeacherCommentService;
    const author = "johndoe";

    beforeEach(() => {
        commentProvider = new TeacherCommentService(author);
    });

    afterEach(() => {
        mockedVscode.comments.createCommentController.mockClear();
    });

    it("should create correctly", () => {
        expect(mockedVscode.comments.createCommentController).toHaveBeenCalledTimes(1);
        expect(mockedVscode.comments.createCommentController).toHaveBeenNthCalledWith(1, "teacherComments", "Teacher comments");

        expect(commentProvider.commentController.commentingRangeProvider?.provideCommentingRanges).toBeTruthy();
    });

    it("should add comment correctly", () => {
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
            headers: [],
            config: {},
        };

        mockedClient.saveComment.mockResolvedValueOnce(savedCommentResponse);
        const errorCallback = jest.fn();

        return commentProvider.addComment(replyMock, fileId).then(() => {
            expect(errorCallback).toHaveBeenCalledTimes(0);
            expect(threadMock.comments).toHaveLength(3);
            const addedComment = threadMock.comments[2] as NoteComment;
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
    });
});
