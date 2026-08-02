import express from "express";

import { authenticate } from "../../middleware/authenticate.js";

import { validate } from "../../middleware/validate.js";

import {
  createNotificationController,
  getUserNotificationsController,
  getUserNotificationByIdController,
  getUnreadNotificationCountController,
  markNotificationAsReadController,
  markAllNotificationsAsReadController,
  dismissNotificationController,
  restoreNotificationController,
  deleteUserNotificationController,
  updateNotificationController,
  deactivateNotificationController
} from "../../controllers/notification/notification.controller.js";

import {
  createNotificationSchema,
  updateNotificationSchema,
  listNotificationsSchema,
  notificationIdParamSchema,
  markNotificationReadSchema,
  dismissNotificationSchema,
  deleteUserNotificationSchema,
  markAllNotificationsReadSchema
} from "../../validators/notification/notification.validator.js";

/*
|--------------------------------------------------------------------------
| Notification Router
|--------------------------------------------------------------------------
*/

const router =
  express.Router();

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

router.use(
  authenticate
);

/*
|--------------------------------------------------------------------------
| User Notification Routes
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Get Notification List
|--------------------------------------------------------------------------
|
| GET /api/notifications
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  validate(
    listNotificationsSchema
  ),
  getUserNotificationsController
);

/*
|--------------------------------------------------------------------------
| Get Unread Notification Count
|--------------------------------------------------------------------------
|
| GET /api/notifications/unread-count
|--------------------------------------------------------------------------
*/

router.get(
  "/unread-count",
  getUnreadNotificationCountController
);

/*
|--------------------------------------------------------------------------
| Mark All Notifications As Read
|--------------------------------------------------------------------------
|
| PATCH /api/notifications/read-all
|--------------------------------------------------------------------------
*/

router.patch(
  "/read-all",
  validate(
    markAllNotificationsReadSchema
  ),
  markAllNotificationsAsReadController
);

/*
|--------------------------------------------------------------------------
| Get Notification Details
|--------------------------------------------------------------------------
|
| GET /api/notifications/:notificationId
|--------------------------------------------------------------------------
*/

router.get(
  "/:notificationId",
  validate(
    notificationIdParamSchema
  ),
  getUserNotificationByIdController
);

/*
|--------------------------------------------------------------------------
| Mark Notification As Read
|--------------------------------------------------------------------------
|
| PATCH /api/notifications/:notificationId/read
|--------------------------------------------------------------------------
*/

router.patch(
  "/:notificationId/read",
  validate(
    markNotificationReadSchema
  ),
  markNotificationAsReadController
);

/*
|--------------------------------------------------------------------------
| Dismiss Notification
|--------------------------------------------------------------------------
|
| PATCH /api/notifications/:notificationId/dismiss
|--------------------------------------------------------------------------
*/

router.patch(
  "/:notificationId/dismiss",
  validate(
    dismissNotificationSchema
  ),
  dismissNotificationController
);

/*
|--------------------------------------------------------------------------
| Restore Notification
|--------------------------------------------------------------------------
|
| PATCH /api/notifications/:notificationId/restore
|--------------------------------------------------------------------------
*/

router.patch(
  "/:notificationId/restore",
  validate(
    notificationIdParamSchema
  ),
  restoreNotificationController
);

/*
|--------------------------------------------------------------------------
| Delete User Notification
|--------------------------------------------------------------------------
|
| DELETE /api/notifications/:notificationId
|--------------------------------------------------------------------------
*/

router.delete(
  "/:notificationId",
  validate(
    deleteUserNotificationSchema
  ),
  deleteUserNotificationController
);

/*
|--------------------------------------------------------------------------
| Notification Management Routes
|--------------------------------------------------------------------------
|
| These should eventually use an admin-only middleware.
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Create Notification
|--------------------------------------------------------------------------
|
| POST /api/notifications/manage
|--------------------------------------------------------------------------
*/

router.post(
  "/manage",
  validate(
    createNotificationSchema
  ),
  createNotificationController
);

/*
|--------------------------------------------------------------------------
| Update Notification
|--------------------------------------------------------------------------
|
| PATCH /api/notifications/manage/:notificationId
|--------------------------------------------------------------------------
*/

router.patch(
  "/manage/:notificationId",
  validate(
    updateNotificationSchema
  ),
  updateNotificationController
);

/*
|--------------------------------------------------------------------------
| Deactivate Notification
|--------------------------------------------------------------------------
|
| PATCH /api/notifications/manage/:notificationId/deactivate
|--------------------------------------------------------------------------
*/

router.patch(
  "/manage/:notificationId/deactivate",
  validate(
    notificationIdParamSchema
  ),
  deactivateNotificationController
);

export default router;