import { describe, it, expect, afterAll } from "bun:test";
import { NextRequest } from "next/server";
import { db } from "@/src/db";
import { users, teams, teamMembers, projects, apiKeys, sessionTokens } from "@/src/db/schema";
import { eq, inArray } from "drizzle-orm";

import { POST as registerPost } from "@/app/api/auth/register/route";
import { POST as loginPost } from "@/app/api/auth/login/route";
import { POST as createTeamPost } from "@/app/api/team/create/route";
import { POST as joinTeamPost } from "@/app/api/team/join/route";
import { POST as createProjectPost } from "@/app/api/project/create/route";
import { POST as createApiKeyPost } from "@/app/api/api-key/create/route";
import { POST as revealApiKeyPost } from "@/app/api/api-key/reveal/route";
import { GET as listApiKeysGet } from "@/app/api/api-key/list/route";
import { POST as createTokenPost } from "@/app/api/token/create/route";

const TEST_TIMEOUT = 30000;

describe("KeyBase Refactoring Guardrails Suite", () => {
  const rand = Math.random().toString(36).substring(7);
  const email1 = `refactor_test_1_${rand}@example.com`;
  const email2 = `refactor_test_2_${rand}@example.com`;
  const password = "Password123!";

  let token1 = "";
  let token2 = "";
  let user1Id: number;
  let user2Id: number;
  let teamId: number;
  let teamCode = "";
  let projectId: number;
  let apiKeyId: number;
  let sessionTokenString = "";

  const createdUserIds: number[] = [];
  const createdTeamIds: number[] = [];
  const createdProjectIds: number[] = [];

  afterAll(async () => {
    // Cleanup in reverse dependency order
    if (createdProjectIds.length > 0) {
      await db.delete(apiKeys).where(inArray(apiKeys.projectId, createdProjectIds));
      await db.delete(sessionTokens).where(inArray(sessionTokens.projectId, createdProjectIds));
      await db.delete(projects).where(inArray(projects.id, createdProjectIds));
    }
    if (createdTeamIds.length > 0) {
      await db.delete(teamMembers).where(inArray(teamMembers.teamId, createdTeamIds));
      await db.delete(teams).where(inArray(teams.id, createdTeamIds));
    }
    if (createdUserIds.length > 0) {
      await db.delete(teamMembers).where(inArray(teamMembers.userId, createdUserIds));
      await db.delete(users).where(inArray(users.id, createdUserIds));
    }
  }, TEST_TIMEOUT);

  it("should register a new user successfully", async () => {
    const req = new NextRequest("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email: email1, password }),
    });
    const res = await registerPost(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.token).toBeDefined();
    expect(body.user.email).toBe(email1);
    
    token1 = body.token;
    user1Id = body.user.id;
    createdUserIds.push(user1Id);
  }, TEST_TIMEOUT);

  it("should prevent duplicate email registration", async () => {
    const req = new NextRequest("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email: email1, password }),
    });
    const res = await registerPost(req);
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body.error).toBe("Email already exists");
  }, TEST_TIMEOUT);

  it("should authenticate user and fail on bad password", async () => {
    // Bad login
    const badReq = new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: email1, password: "WrongPassword" }),
    });
    const badRes = await loginPost(badReq);
    expect(badRes.status).toBe(401);

    // Good login
    const goodReq = new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: email1, password }),
    });
    const goodRes = await loginPost(goodReq);
    const goodBody = await goodRes.json();

    expect(goodRes.status).toBe(200);
    expect(goodBody.success).toBe(true);
    expect(goodBody.token).toBeDefined();
  }, TEST_TIMEOUT);

  it("should register a second user for team testing", async () => {
    const req = new NextRequest("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email: email2, password }),
    });
    const res = await registerPost(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    token2 = body.token;
    user2Id = body.user.id;
    createdUserIds.push(user2Id);
  }, TEST_TIMEOUT);

  it("should create a team for the user", async () => {
    const req = new NextRequest("http://localhost/api/team/create", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token1}`,
      },
      body: JSON.stringify({ name: `Test Team ${rand}` }),
    });
    const res = await createTeamPost(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.team.id).toBeDefined();
    
    teamId = body.team.id;
    teamCode = body.team.teamCode;
    createdTeamIds.push(teamId);
  }, TEST_TIMEOUT);

  it("should allow a second user to join the team with the team code", async () => {
    const req = new NextRequest("http://localhost/api/team/join", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token2}`,
      },
      body: JSON.stringify({ code: teamCode }),
    });
    const res = await joinTeamPost(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.team.id).toBe(teamId);
  }, TEST_TIMEOUT);

  it("should create a project under the team", async () => {
    const req = new NextRequest("http://localhost/api/project/create", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token1}`,
      },
      body: JSON.stringify({ teamId, name: `Test Project ${rand}` }),
    });
    const res = await createProjectPost(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.project.id).toBeDefined();

    projectId = body.project.id;
    createdProjectIds.push(projectId);
  }, TEST_TIMEOUT);

  it("should create an API key in the project", async () => {
    const req = new NextRequest("http://localhost/api/api-key/create", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token1}`,
      },
      body: JSON.stringify({ name: "TEST_API_KEY", key: "super-secret-key-123", projectId }),
    });
    const res = await createApiKeyPost(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.apiKey.id).toBeDefined();

    apiKeyId = body.apiKey.id;
  }, TEST_TIMEOUT);

  it("should reveal the API key to a authorized user", async () => {
    const req = new NextRequest("http://localhost/api/api-key/reveal", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token2}`, // member of the team
      },
      body: JSON.stringify({ keyId: apiKeyId }),
    });
    const res = await revealApiKeyPost(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toBe("super-secret-key-123");
  }, TEST_TIMEOUT);

  it("should deny API key reveal to an unauthorized token", async () => {
    // Generate a token for a new user not in the team
    const guestReq = new NextRequest("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email: `refactor_guest_${rand}@example.com`, password }),
    });
    const guestRes = await registerPost(guestReq);
    const guestBody = await guestRes.json();
    const guestToken = guestBody.token;
    createdUserIds.push(guestBody.user.id);

    const req = new NextRequest("http://localhost/api/api-key/reveal", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${guestToken}`,
      },
      body: JSON.stringify({ keyId: apiKeyId }),
    });
    const res = await revealApiKeyPost(req);
    const body = await res.json();

    expect(res.status).toBe(403);
  }, TEST_TIMEOUT);

  it("should create a session token and allow list access using it", async () => {
    // Create session token
    const tokenReq = new NextRequest("http://localhost/api/token/create", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token1}`,
      },
      body: JSON.stringify({ projectId, name: "CLI Token", expiryDays: 7 }),
    });
    const tokenRes = await createTokenPost(tokenReq);
    const tokenBody = await tokenRes.json();

    expect(tokenRes.status).toBe(200);
    expect(tokenBody.success).toBe(true);
    expect(tokenBody.token).toBeDefined();

    sessionTokenString = tokenBody.token;

    // Use session token to list keys
    const listReq = new NextRequest(`http://localhost/api/api-key/list?projectId=${projectId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${sessionTokenString}`,
      },
    });
    const listRes = await listApiKeysGet(listReq);
    const listBody = await listRes.json();

    expect(listRes.status).toBe(200);
    expect(listBody.success).toBe(true);
    expect(listBody.data.length).toBeGreaterThanOrEqual(1);
    expect(listBody.data[0].name).toBe("TEST_API_KEY");
  }, TEST_TIMEOUT);
});
