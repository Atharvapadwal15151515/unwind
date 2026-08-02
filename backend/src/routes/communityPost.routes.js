import express from "express";

import { authenticate } from "../middleware/authenticate.js";
import { validate } from "../middleware/validate.js";
import { uploadPostMedia } from "../middleware/upload.js";

import {
  createPostRequestSchema,
  updatePostRequestSchema,
  getPostRequestSchema,
  getFeedRequestSchema,
  getUserPostsRequestSchema
} from "../validators/post.validator.js";

import {
  createCommunityPostController,
  getCommunityPostController,
  getCommunityFeedController,
  updateCommunityPostController,
  deleteCommunityPostController,
  getUserPostsController
} from "../controllers/community/communityPost.controller.js";

import {
  likePostController,
  unlikePostController
} from "../controllers/community/postLike.controller.js";

const router = express.Router();

router.use(authenticate);

/*
|--------------------------------------------------------------------------
| Community Posts
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  uploadPostMedia,
  validate(createPostRequestSchema),
  createCommunityPostController
);

router.get(
  "/feed",
  validate(getFeedRequestSchema),
  getCommunityFeedController
);

router.get(
  "/user/:userId",
  validate(getUserPostsRequestSchema),
  getUserPostsController
);

router.get(
  "/:postId",
  validate(getPostRequestSchema),
  getCommunityPostController
);

router.patch(
  "/:postId",
  validate(updatePostRequestSchema),
  updateCommunityPostController
);

router.delete(
  "/:postId",
  validate(getPostRequestSchema),
  deleteCommunityPostController
);

/*
|--------------------------------------------------------------------------
| Post Likes
|--------------------------------------------------------------------------
*/

router.post(
  "/:postId/like",
  validate(getPostRequestSchema),
  likePostController
);

router.delete(
  "/:postId/like",
  validate(getPostRequestSchema),
  unlikePostController
);

export default router;