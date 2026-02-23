// =============================================================
// Virtual Homeschool LMS - Database Seed
// Run: npm run db:seed
// =============================================================

import { PrismaClient, Role, Curriculum, Term } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clean existing data
  await prisma.grade.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.note.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.classSubject.deleteMany();
  await prisma.classTeacher.deleteMany();
  await prisma.user.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.class.deleteMany();

  console.log("🗑️  Cleared existing data");

  // -------------------------------------------------------
  // SUBJECTS
  // -------------------------------------------------------
  const igcseSubjects = await Promise.all([
    prisma.subject.create({
      data: {
        name: "Mathematics",
        curriculum: Curriculum.IGCSE,
        code: "IGCSE-MATH",
        description: "IGCSE Mathematics (Extended)",
        color: "#7C3AED",
      },
    }),
    prisma.subject.create({
      data: {
        name: "English Language",
        curriculum: Curriculum.IGCSE,
        code: "IGCSE-ENG",
        description: "IGCSE English Language",
        color: "#0EA5E9",
      },
    }),
    prisma.subject.create({
      data: {
        name: "Physics",
        curriculum: Curriculum.IGCSE,
        code: "IGCSE-PHY",
        description: "IGCSE Physics",
        color: "#F59E0B",
      },
    }),
    prisma.subject.create({
      data: {
        name: "Chemistry",
        curriculum: Curriculum.IGCSE,
        code: "IGCSE-CHEM",
        description: "IGCSE Chemistry",
        color: "#EF4444",
      },
    }),
    prisma.subject.create({
      data: {
        name: "Biology",
        curriculum: Curriculum.IGCSE,
        code: "IGCSE-BIO",
        description: "IGCSE Biology",
        color: "#22C55E",
      },
    }),
    prisma.subject.create({
      data: {
        name: "Computer Science",
        curriculum: Curriculum.IGCSE,
        code: "IGCSE-CS",
        description: "IGCSE Computer Science",
        color: "#8B5CF6",
      },
    }),
    prisma.subject.create({
      data: {
        name: "Geography",
        curriculum: Curriculum.IGCSE,
        code: "IGCSE-GEO",
        description: "IGCSE Geography",
        color: "#06B6D4",
      },
    }),
    prisma.subject.create({
      data: {
        name: "History",
        curriculum: Curriculum.IGCSE,
        code: "IGCSE-HIS",
        description: "IGCSE History",
        color: "#D97706",
      },
    }),
  ]);

  const cbcSubjects = await Promise.all([
    prisma.subject.create({
      data: {
        name: "Mathematics",
        curriculum: Curriculum.CBC,
        code: "CBC-MATH",
        description: "CBC Mathematics",
        color: "#7C3AED",
      },
    }),
    prisma.subject.create({
      data: {
        name: "English",
        curriculum: Curriculum.CBC,
        code: "CBC-ENG",
        description: "CBC English",
        color: "#0EA5E9",
      },
    }),
    prisma.subject.create({
      data: {
        name: "Kiswahili",
        curriculum: Curriculum.CBC,
        code: "CBC-KIS",
        description: "CBC Kiswahili",
        color: "#10B981",
      },
    }),
    prisma.subject.create({
      data: {
        name: "Science & Technology",
        curriculum: Curriculum.CBC,
        code: "CBC-SCI",
        description: "CBC Science and Technology",
        color: "#F59E0B",
      },
    }),
    prisma.subject.create({
      data: {
        name: "Social Studies",
        curriculum: Curriculum.CBC,
        code: "CBC-SS",
        description: "CBC Social Studies",
        color: "#EF4444",
      },
    }),
    prisma.subject.create({
      data: {
        name: "Religious Education",
        curriculum: Curriculum.CBC,
        code: "CBC-RE",
        description: "CBC Christian / Islamic Religious Education",
        color: "#8B5CF6",
      },
    }),
    prisma.subject.create({
      data: {
        name: "Creative Arts",
        curriculum: Curriculum.CBC,
        code: "CBC-ART",
        description: "CBC Creative Arts",
        color: "#EC4899",
      },
    }),
  ]);

  console.log(
    `✅ Created ${igcseSubjects.length} IGCSE subjects and ${cbcSubjects.length} CBC subjects`
  );

  // -------------------------------------------------------
  // CLASSES
  // -------------------------------------------------------
  const igcseClasses = await Promise.all([
    prisma.class.create({
      data: {
        name: "Year 9 - IGCSE",
        curriculum: Curriculum.IGCSE,
        gradeLevel: "Year 9",
        description: "IGCSE Year 9 cohort",
      },
    }),
    prisma.class.create({
      data: {
        name: "Year 10 - IGCSE",
        curriculum: Curriculum.IGCSE,
        gradeLevel: "Year 10",
        description: "IGCSE Year 10 cohort",
      },
    }),
    prisma.class.create({
      data: {
        name: "Year 11 - IGCSE",
        curriculum: Curriculum.IGCSE,
        gradeLevel: "Year 11",
        description: "IGCSE Year 11 cohort — Final exams",
      },
    }),
  ]);

  const cbcClasses = await Promise.all([
    prisma.class.create({
      data: {
        name: "Grade 6 - CBC",
        curriculum: Curriculum.CBC,
        gradeLevel: "Grade 6",
        description: "CBC Grade 6 Upper Primary",
      },
    }),
    prisma.class.create({
      data: {
        name: "Grade 7 - CBC",
        curriculum: Curriculum.CBC,
        gradeLevel: "Grade 7",
        description: "CBC Grade 7 Junior Secondary",
      },
    }),
    prisma.class.create({
      data: {
        name: "Grade 8 - CBC",
        curriculum: Curriculum.CBC,
        gradeLevel: "Grade 8",
        description: "CBC Grade 8 Junior Secondary",
      },
    }),
  ]);

  console.log(
    `✅ Created ${igcseClasses.length} IGCSE classes and ${cbcClasses.length} CBC classes`
  );

  // Assign subjects to IGCSE classes
  for (const cls of igcseClasses) {
    for (const subject of igcseSubjects) {
      await prisma.classSubject.create({
        data: { classId: cls.id, subjectId: subject.id },
      });
    }
  }

  // Assign subjects to CBC classes
  for (const cls of cbcClasses) {
    for (const subject of cbcSubjects) {
      await prisma.classSubject.create({
        data: { classId: cls.id, subjectId: subject.id },
      });
    }
  }

  console.log("✅ Assigned subjects to classes");

  // -------------------------------------------------------
  // USERS
  // -------------------------------------------------------
  const hashedPassword = await bcrypt.hash("Password123!", 12);

  // Admin
  const admin = await prisma.user.create({
    data: {
      name: "System Administrator",
      email: "admin@eduverse.ac.ke",
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  // IGCSE Teachers
  const igcseTeacher1 = await prisma.user.create({
    data: {
      name: "Mr. James Waweru",
      email: "j.waweru@eduverse.ac.ke",
      password: hashedPassword,
      role: Role.TEACHER,
      curriculum: Curriculum.IGCSE,
    },
  });

  const igcseTeacher2 = await prisma.user.create({
    data: {
      name: "Ms. Sarah Kamau",
      email: "s.kamau@eduverse.ac.ke",
      password: hashedPassword,
      role: Role.TEACHER,
      curriculum: Curriculum.IGCSE,
    },
  });

  // CBC Teachers
  const cbcTeacher1 = await prisma.user.create({
    data: {
      name: "Mrs. Grace Odhiambo",
      email: "g.odhiambo@eduverse.ac.ke",
      password: hashedPassword,
      role: Role.TEACHER,
      curriculum: Curriculum.CBC,
    },
  });

  const cbcTeacher2 = await prisma.user.create({
    data: {
      name: "Mr. Peter Njoroge",
      email: "p.njoroge@eduverse.ac.ke",
      password: hashedPassword,
      role: Role.TEACHER,
      curriculum: Curriculum.CBC,
    },
  });

  // IGCSE Students
  const igcseStudents = await Promise.all([
    prisma.user.create({
      data: {
        name: "Amara Otieno",
        email: "amara.otieno@students.eduverse.ac.ke",
        password: hashedPassword,
        role: Role.STUDENT,
        curriculum: Curriculum.IGCSE,
        classId: igcseClasses[1].id, // Year 10
      },
    }),
    prisma.user.create({
      data: {
        name: "David Mwangi",
        email: "david.mwangi@students.eduverse.ac.ke",
        password: hashedPassword,
        role: Role.STUDENT,
        curriculum: Curriculum.IGCSE,
        classId: igcseClasses[1].id,
      },
    }),
    prisma.user.create({
      data: {
        name: "Fatima Hassan",
        email: "fatima.hassan@students.eduverse.ac.ke",
        password: hashedPassword,
        role: Role.STUDENT,
        curriculum: Curriculum.IGCSE,
        classId: igcseClasses[2].id, // Year 11
      },
    }),
    prisma.user.create({
      data: {
        name: "Kevin Kipchoge",
        email: "kevin.kipchoge@students.eduverse.ac.ke",
        password: hashedPassword,
        role: Role.STUDENT,
        curriculum: Curriculum.IGCSE,
        classId: igcseClasses[0].id, // Year 9
      },
    }),
  ]);

  // CBC Students
  const cbcStudents = await Promise.all([
    prisma.user.create({
      data: {
        name: "Aisha Abdullahi",
        email: "aisha.abdullahi@students.eduverse.ac.ke",
        password: hashedPassword,
        role: Role.STUDENT,
        curriculum: Curriculum.CBC,
        classId: cbcClasses[1].id, // Grade 7
      },
    }),
    prisma.user.create({
      data: {
        name: "Brian Njiru",
        email: "brian.njiru@students.eduverse.ac.ke",
        password: hashedPassword,
        role: Role.STUDENT,
        curriculum: Curriculum.CBC,
        classId: cbcClasses[1].id,
      },
    }),
    prisma.user.create({
      data: {
        name: "Cynthia Wanjiku",
        email: "cynthia.wanjiku@students.eduverse.ac.ke",
        password: hashedPassword,
        role: Role.STUDENT,
        curriculum: Curriculum.CBC,
        classId: cbcClasses[2].id, // Grade 8
      },
    }),
  ]);

  console.log(
    `✅ Created 1 admin, 4 teachers, ${igcseStudents.length + cbcStudents.length} students`
  );

  // Assign teachers to classes
  await prisma.classTeacher.createMany({
    data: [
      { classId: igcseClasses[0].id, teacherId: igcseTeacher1.id },
      { classId: igcseClasses[1].id, teacherId: igcseTeacher1.id },
      { classId: igcseClasses[2].id, teacherId: igcseTeacher2.id },
      { classId: cbcClasses[0].id, teacherId: cbcTeacher1.id },
      { classId: cbcClasses[1].id, teacherId: cbcTeacher1.id },
      { classId: cbcClasses[2].id, teacherId: cbcTeacher2.id },
    ],
  });

  console.log("✅ Assigned teachers to classes");

  // -------------------------------------------------------
  // SAMPLE NOTES
  // -------------------------------------------------------
  const note1 = await prisma.note.create({
    data: {
      title: "Introduction to Algebra",
      description: "Covering linear equations, inequalities and quadratics",
      content:
        "## Introduction to Algebra\n\n### Linear Equations\nA linear equation is an equation where the highest power of the variable is 1.\n\n**Example:** 2x + 5 = 13\n\n**Solution:**\n- 2x = 13 - 5\n- 2x = 8\n- x = 4\n\n### Key Concepts\n1. Variables and Constants\n2. Solving for unknowns\n3. Checking solutions",
      term: Term.TERM_1,
      teacherId: igcseTeacher1.id,
      classId: igcseClasses[1].id,
      subjectId: igcseSubjects[0].id, // Math
    },
  });

  const note2 = await prisma.note.create({
    data: {
      title: "Forces and Motion",
      description: "Newton's Laws of Motion - Unit 2 Overview",
      content:
        "## Forces and Motion\n\n### Newton's First Law\nAn object at rest stays at rest, and an object in motion stays in motion...\n\n### Newton's Second Law\nF = ma (Force = mass × acceleration)\n\n### Newton's Third Law\nFor every action, there is an equal and opposite reaction.",
      term: Term.TERM_1,
      teacherId: igcseTeacher2.id,
      classId: igcseClasses[1].id,
      subjectId: igcseSubjects[2].id, // Physics
    },
  });

  const note3 = await prisma.note.create({
    data: {
      title: "Hesabu - Fremu ya Kazi",
      description: "Sehemu ya kwanza ya Hesabu - Nambari na Shughuli",
      content:
        "## Hesabu - Fremu ya Kazi\n\n### Nambari Nzima\nNambari nzima ni nambari ambazo hazina sehemu ya desimali.\n\n**Mifano:** 1, 2, 3, 100, 1000\n\n### Shughuli za Msingi\n- Kuongeza\n- Kutoa\n- Kuzidisha\n- Kugawanya",
      term: Term.TERM_1,
      teacherId: cbcTeacher1.id,
      classId: cbcClasses[1].id,
      subjectId: cbcSubjects[0].id, // CBC Math
    },
  });

  console.log("✅ Created sample notes");

  // -------------------------------------------------------
  // SAMPLE ASSIGNMENTS
  // -------------------------------------------------------
  const assignment1 = await prisma.assignment.create({
    data: {
      title: "Algebra Problem Set 1",
      description:
        "Solve the following algebraic equations and show all working:\n\n1. Solve for x: 3x + 7 = 22\n2. Solve for y: 2y - 4 = 10\n3. Solve the system: x + y = 10, x - y = 2\n4. Factorise: x² + 5x + 6\n5. Solve the quadratic: x² - 4x - 5 = 0\n\nAll answers must show full working. Submit as PDF.",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      maxScore: 50,
      teacherId: igcseTeacher1.id,
      classId: igcseClasses[1].id,
      subjectId: igcseSubjects[0].id,
    },
  });

  const assignment2 = await prisma.assignment.create({
    data: {
      title: "Forces Essay",
      description:
        "Write a 500-word essay on Newton's Laws of Motion. Include:\n1. Explanation of each law\n2. Real-world examples for each\n3. How the laws relate to space exploration\n\nFormat: PDF, Times New Roman, 12pt, 1.5 line spacing.",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      maxScore: 40,
      teacherId: igcseTeacher2.id,
      classId: igcseClasses[1].id,
      subjectId: igcseSubjects[2].id,
    },
  });

  console.log("✅ Created sample assignments");

  // -------------------------------------------------------
  // SAMPLE SUBMISSION + GRADE
  // -------------------------------------------------------
  const submission1 = await prisma.submission.create({
    data: {
      studentId: igcseStudents[0].id,
      assignmentId: assignment1.id,
      fileName: "amara_algebra_ps1.pdf",
      status: "GRADED",
    },
  });

  await prisma.grade.create({
    data: {
      submissionId: submission1.id,
      teacherId: igcseTeacher1.id,
      score: 44,
      maxScore: 50,
      feedback:
        "Excellent work, Amara! Your solutions for questions 1-4 were perfect. Question 5 had a minor sign error but the method was correct. Keep it up!",
    },
  });

  console.log("✅ Created sample submission and grade");

  // -------------------------------------------------------
  // SAMPLE MEETINGS
  // -------------------------------------------------------
  await prisma.meeting.createMany({
    data: [
      {
        title: "IGCSE Maths Live Class - Quadratics",
        description: "Live session on quadratic equations and graphs",
        meetingUrl: "https://meet.google.com/abc-defg-hij",
        scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        duration: 60,
        platform: "Google Meet",
        teacherId: igcseTeacher1.id,
        classId: igcseClasses[1].id,
        subjectId: igcseSubjects[0].id,
      },
      {
        title: "Physics Q&A Session",
        description: "Open questions on Forces and Motion",
        meetingUrl: "https://zoom.us/j/1234567890",
        scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        duration: 45,
        platform: "Zoom",
        teacherId: igcseTeacher2.id,
        classId: igcseClasses[1].id,
        subjectId: igcseSubjects[2].id,
      },
      {
        title: "CBC Grade 7 Mathematics",
        description: "Fractions and decimals live class",
        meetingUrl: "https://meet.google.com/xyz-uvwx-yz1",
        scheduledAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        duration: 50,
        platform: "Google Meet",
        teacherId: cbcTeacher1.id,
        classId: cbcClasses[1].id,
        subjectId: cbcSubjects[0].id,
      },
    ],
  });

  console.log("✅ Created sample meetings");

  // -------------------------------------------------------
  // ANNOUNCEMENTS
  // -------------------------------------------------------
  await prisma.announcement.createMany({
    data: [
      {
        title: "Welcome to EduVerse LMS!",
        content:
          "Welcome to the new academic year! This platform will be your central hub for notes, assignments, and virtual classes. Please ensure your profiles are complete. Reach out to admin@eduverse.ac.ke for any issues.",
        target: "ALL",
        isPinned: true,
        authorId: admin.id,
      },
      {
        title: "Term 1 Schedule Published",
        content:
          "The full Term 1 timetable has been uploaded. Teachers, please ensure all meeting links are added at least 24 hours before class. Students, check your class schedule regularly.",
        target: "ALL",
        authorId: admin.id,
      },
      {
        title: "Assignment Submission Guidelines",
        content:
          "All assignments must be submitted as PDF files. Maximum file size is 10MB. Submissions after the deadline will be marked as LATE. Contact your teacher for extension requests.",
        target: "STUDENT",
        authorId: admin.id,
      },
      {
        title: "Grading Deadline Reminder",
        content:
          "All teachers must grade submitted assignments within 5 working days of the due date. Use the grading panel in your dashboard. Feedback is mandatory for all graded work.",
        target: "TEACHER",
        authorId: admin.id,
      },
    ],
  });

  console.log("✅ Created announcements");

  // -------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------
  console.log("\n🎉 Seed completed successfully!\n");
  console.log("📋 Login Credentials (all use Password123!):");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("👑 Admin:   admin@eduverse.ac.ke");
  console.log("👩‍🏫 Teacher: j.waweru@eduverse.ac.ke    (IGCSE)");
  console.log("👩‍🏫 Teacher: s.kamau@eduverse.ac.ke     (IGCSE)");
  console.log("👩‍🏫 Teacher: g.odhiambo@eduverse.ac.ke  (CBC)");
  console.log("👩‍🏫 Teacher: p.njoroge@eduverse.ac.ke   (CBC)");
  console.log(
    "🎓 Student: amara.otieno@students.eduverse.ac.ke (IGCSE Year 10)"
  );
  console.log(
    "🎓 Student: david.mwangi@students.eduverse.ac.ke (IGCSE Year 10)"
  );
  console.log(
    "🎓 Student: aisha.abdullahi@students.eduverse.ac.ke (CBC Grade 7)"
  );
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
