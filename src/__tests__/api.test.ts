// =============================================================
// API Integration Tests (basic)
// These run against the Next.js test environment
// =============================================================

// Note: Full API testing requires a test database.
// These are structural tests to verify route exports.

describe("API Route Structure", () => {
  it("should have correct API route exports", async () => {
    // Test that the route files export GET and POST handlers
    const usersRoute = await import("../app/api/users/route");
    expect(typeof usersRoute.GET).toBe("function");
    expect(typeof usersRoute.POST).toBe("function");
  });

  it("should have notes API with GET and POST", async () => {
    const notesRoute = await import("../app/api/notes/route");
    expect(typeof notesRoute.GET).toBe("function");
    expect(typeof notesRoute.POST).toBe("function");
  });

  it("should have assignments API with GET and POST", async () => {
    const assignmentsRoute = await import("../app/api/assignments/route");
    expect(typeof assignmentsRoute.GET).toBe("function");
    expect(typeof assignmentsRoute.POST).toBe("function");
  });

  it("should have grades API with GET and POST", async () => {
    const gradesRoute = await import("../app/api/grades/route");
    expect(typeof gradesRoute.GET).toBe("function");
    expect(typeof gradesRoute.POST).toBe("function");
  });
});

describe("Validation Schemas", () => {
  it("should validate user creation data", () => {
    const { createUserSchema } = require("../lib/validations");

    const validData = {
      name: "Test User",
      email: "test@example.com",
      password: "Password123!",
      role: "STUDENT",
      curriculum: "IGCSE",
    };

    const result = createUserSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject invalid email", () => {
    const { createUserSchema } = require("../lib/validations");

    const invalidData = {
      name: "Test User",
      email: "not-an-email",
      password: "Password123!",
      role: "STUDENT",
    };

    const result = createUserSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should reject weak password", () => {
    const { createUserSchema } = require("../lib/validations");

    const invalidData = {
      name: "Test User",
      email: "test@example.com",
      password: "weak",
      role: "STUDENT",
    };

    const result = createUserSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should validate assignment creation data", () => {
    const { createAssignmentSchema } = require("../lib/validations");

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    const validData = {
      title: "Test Assignment",
      description: "This is a test assignment with enough description length",
      dueDate: futureDate.toISOString(),
      maxScore: 100,
      classId: "class-id-here",
      subjectId: "subject-id-here",
    };

    const result = createAssignmentSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});
