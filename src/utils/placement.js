/** Age-based placement within a pathway's ordered course list. */

/**
 * Pick the best starting course in a pathway for a given learner age.
 *
 * Courses are in learning order. We prefer the last course (furthest along)
 * whose age range the learner still fits, so an older learner isn't pointed
 * back at a course meant for much younger kids. If the age is below every
 * course's range, recommend the first course. If it's above every course's
 * range, recommend the last (most advanced) course.
 *
 * @param {Array<{name:string, ageMin:?number, ageMax:?number}>} courses
 * @param {number} age
 * @returns {{ course: object, index: number } | null}
 */
export function suggestStartingCourse(courses, age) {
  if (!Array.isArray(courses) || courses.length === 0 || !Number.isFinite(age)) {
    return null;
  }

  let best = null;

  courses.forEach((course, index) => {
    const min = course.ageMin ?? -Infinity;
    const max = course.ageMax ?? Infinity;
    if (age >= min && age <= max) {
      best = { course, index };
    }
  });

  if (best) return best;

  const first = courses[0];
  if (first.ageMin != null && age < first.ageMin) {
    return { course: first, index: 0 };
  }

  const lastIndex = courses.length - 1;
  return { course: courses[lastIndex], index: lastIndex };
}
