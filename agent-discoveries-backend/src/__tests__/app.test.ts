import request from "supertest";
import app from "../app";

describe("Test the root path", () => {
  test("It should respond OK to a GET request", () => {
    return request(app)
      .get("/")
      .then((response) => {
        expect(response.statusCode).toBe(200);
      });
  });
});
