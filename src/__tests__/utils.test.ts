// =============================================================
// Unit Tests - Utility Functions
// =============================================================

import {
  calculatePercentage,
  getGradeLetter,
  getInitials,
  formatFileSize,
  getRoleDashboard,
  getTermLabel,
  getStatusLabel,
  truncate,
} from "@/lib/utils";

describe("calculatePercentage", () => {
  it("returns correct percentage", () => {
    expect(calculatePercentage(75, 100)).toBe(75);
    expect(calculatePercentage(45, 50)).toBe(90);
    expect(calculatePercentage(0, 100)).toBe(0);
  });

  it("handles zero maxScore", () => {
    expect(calculatePercentage(50, 0)).toBe(0);
  });

  it("rounds to nearest integer", () => {
    expect(calculatePercentage(1, 3)).toBe(33);
  });
});

describe("getGradeLetter", () => {
  it("returns correct grade letters", () => {
    expect(getGradeLetter(95)).toBe("A*");
    expect(getGradeLetter(85)).toBe("A");
    expect(getGradeLetter(75)).toBe("B");
    expect(getGradeLetter(65)).toBe("C");
    expect(getGradeLetter(55)).toBe("D");
    expect(getGradeLetter(45)).toBe("E");
    expect(getGradeLetter(30)).toBe("U");
  });
});

describe("getInitials", () => {
  it("returns initials from full name", () => {
    expect(getInitials("John Doe")).toBe("JD");
    expect(getInitials("Mary Jane Watson")).toBe("MJ");
    expect(getInitials("Ali")).toBe("AL");
  });
});

describe("formatFileSize", () => {
  it("formats bytes correctly", () => {
    expect(formatFileSize(0)).toBe("0 B");
    expect(formatFileSize(1024)).toBe("1 KB");
    expect(formatFileSize(1048576)).toBe("1 MB");
    expect(formatFileSize(5 * 1024 * 1024)).toBe("5 MB");
  });
});

describe("getRoleDashboard", () => {
  it("returns correct dashboard path for each role", () => {
    expect(getRoleDashboard("ADMIN")).toBe("/admin");
    expect(getRoleDashboard("TEACHER")).toBe("/teacher");
    expect(getRoleDashboard("STUDENT")).toBe("/student");
    expect(getRoleDashboard("UNKNOWN")).toBe("/login");
  });
});

describe("getTermLabel", () => {
  it("returns human-readable term labels", () => {
    expect(getTermLabel("TERM_1")).toBe("Term 1");
    expect(getTermLabel("TERM_2")).toBe("Term 2");
    expect(getTermLabel("TERM_3")).toBe("Term 3");
  });
});

describe("getStatusLabel", () => {
  it("returns human-readable status labels", () => {
    expect(getStatusLabel("PENDING")).toBe("Not Submitted");
    expect(getStatusLabel("SUBMITTED")).toBe("Submitted");
    expect(getStatusLabel("GRADED")).toBe("Graded");
    expect(getStatusLabel("LATE")).toBe("Late");
  });
});

describe("truncate", () => {
  it("truncates long strings", () => {
    const longStr = "a".repeat(200);
    expect(truncate(longStr, 100)).toHaveLength(103); // 100 + "..."
  });

  it("returns original string if shorter than limit", () => {
    expect(truncate("short", 100)).toBe("short");
  });
});
