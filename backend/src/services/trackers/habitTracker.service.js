import {
  createHabit,
  findActiveHabitsForDate,
  findHabitById,
  findHabitsByUserId,
  pauseHabitById,
  permanentlyDeleteHabitById,
  restoreHabitById,
  resumeHabitById,
  softDeleteHabitById,
  updateHabitById
} from "../../models/trackers/habitTracker.model.js";

import AppError from "../../utils/AppError.js";

import {
  buildPagination,
  parseBooleanQuery,
  parsePositiveInteger,
  removeTotalItems
} from "./trackerService.utils.js";

export async function createHabitRecord(
  userId,
  habitData
) {
  return createHabit(
    userId,
    habitData
  );
}

export async function getHabitById(
  userId,
  habitId,
  includeDeleted = false
) {
  const habit =
    await findHabitById(
      userId,
      habitId,
      includeDeleted
    );

  if (!habit) {
    throw new AppError(
      "Habit not found",
      404
    );
  }

  return habit;
}

export async function getHabits(
  userId,
  query = {}
) {
  const page =
    parsePositiveInteger(
      query.page,
      1
    );

  const limit =
    parsePositiveInteger(
      query.limit,
      20
    );

  const rows =
    await findHabitsByUserId(
      userId,
      {
        category:
          query.category,
        trackingType:
          query.trackingType,
        frequencyType:
          query.frequencyType,
        isActive:
          parseBooleanQuery(
            query.isActive
          ),
        search:
          query.search,
        page,
        limit,
        sortOrder:
          query.sortOrder
      }
    );

  return {
    habits:
      removeTotalItems(rows),
    pagination:
      buildPagination(
        rows,
        page,
        limit
      )
  };
}

export async function getHabitsForDate(
  userId,
  date
) {
  return findActiveHabitsForDate(
    userId,
    date
  );
}

export async function updateHabitRecord(
  userId,
  habitId,
  habitData
) {
  await getHabitById(
    userId,
    habitId
  );

  const updatedHabit =
    await updateHabitById(
      userId,
      habitId,
      habitData
    );

  if (!updatedHabit) {
    throw new AppError(
      "Habit not found",
      404
    );
  }

  return updatedHabit;
}

export async function pauseHabit(
  userId,
  habitId
) {
  const pausedHabit =
    await pauseHabitById(
      userId,
      habitId
    );

  if (!pausedHabit) {
    throw new AppError(
      "Habit not found",
      404
    );
  }

  return pausedHabit;
}

export async function resumeHabit(
  userId,
  habitId
) {
  const resumedHabit =
    await resumeHabitById(
      userId,
      habitId
    );

  if (!resumedHabit) {
    throw new AppError(
      "Habit not found",
      404
    );
  }

  return resumedHabit;
}

export async function softDeleteHabit(
  userId,
  habitId
) {
  const deletedHabit =
    await softDeleteHabitById(
      userId,
      habitId
    );

  if (!deletedHabit) {
    throw new AppError(
      "Habit not found",
      404
    );
  }

  return deletedHabit;
}

export async function restoreHabit(
  userId,
  habitId
) {
  const restoredHabit =
    await restoreHabitById(
      userId,
      habitId
    );

  if (!restoredHabit) {
    throw new AppError(
      "Deleted habit not found",
      404
    );
  }

  return restoredHabit;
}

export async function permanentlyDeleteHabit(
  userId,
  habitId
) {
  const deletedHabit =
    await permanentlyDeleteHabitById(
      userId,
      habitId
    );

  if (!deletedHabit) {
    throw new AppError(
      "Habit not found",
      404
    );
  }

  return deletedHabit;
}
