import pool from "../../config/database.js";

import {
  createDirectConversation,
  findDirectConversationById,
  findDirectConversationBetweenUsers,
  findDirectConversationsForUser,
  updateDirectConversationLastActivity,
  deactivateDirectConversation,
} from "../../models/community/directConversation.model.js";

import {
  addDirectConversationMember,
  findDirectConversationMember,
  findDirectConversationMembers,
  leaveDirectConversationMember,
  rejoinDirectConversationMember,
  updateDirectConversationLastRead,
} from "../../models/community/directConversationMember.model.js";

import {
  getCommunityProfile,
} from "./communityProfile.service.js";

/**
 * Create a consistent service error.
 */
function createServiceError(
  message,
  statusCode = 400,
  code = "DIRECT_CONVERSATION_ERROR"
) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;

  return error;
}

/**
 * Return a user's active community identity.
 */
async function getActiveCommunityIdentity(userId) {
  const community = await getCommunityProfile(userId);

  if (!community?.profile) {
    throw createServiceError(
      "Community profile not found.",
      404,
      "COMMUNITY_PROFILE_NOT_FOUND"
    );
  }

  if (!community.profile.is_active) {
    throw createServiceError(
      "Community access is currently disabled.",
      403,
      "COMMUNITY_ACCESS_DISABLED"
    );
  }

  return {
    profile: community.profile,
    visibleName: community.visibleName,
    identityMode: community.profile.identity_mode,
  };
}

/**
 * Require an active direct conversation.
 */
async function requireDirectConversation(conversationId) {
  const conversation =
    await findDirectConversationById(conversationId);

  if (!conversation) {
    throw createServiceError(
      "Direct conversation not found.",
      404,
      "DIRECT_CONVERSATION_NOT_FOUND"
    );
  }

  if (!conversation.is_active) {
    throw createServiceError(
      "This direct conversation is no longer active.",
      410,
      "DIRECT_CONVERSATION_INACTIVE"
    );
  }

  return conversation;
}

/**
 * Require the requesting user to be an active member.
 */
async function requireConversationMember(
  conversationId,
  userId
) {
  const member = await findDirectConversationMember(
    conversationId,
    userId
  );

  if (!member) {
    throw createServiceError(
      "You are not a member of this conversation.",
      403,
      "DIRECT_CONVERSATION_MEMBERSHIP_REQUIRED"
    );
  }

  return member;
}

/**
 * Start a direct conversation or return an existing one.
 */
export async function startDirectConversation({
  userId,
  recipientUserId,
}) {
  if (!recipientUserId) {
    throw createServiceError(
      "Recipient user ID is required.",
      400,
      "RECIPIENT_REQUIRED"
    );
  }

  if (userId === recipientUserId) {
    throw createServiceError(
      "You cannot start a direct conversation with yourself.",
      400,
      "SELF_CONVERSATION_NOT_ALLOWED"
    );
  }

  const senderCommunity =
    await getActiveCommunityIdentity(userId);

  const recipientCommunity =
    await getActiveCommunityIdentity(recipientUserId);

  const existingConversation =
    await findDirectConversationBetweenUsers(
      userId,
      recipientUserId
    );

  if (existingConversation) {
    const senderMembership =
      await findDirectConversationMember(
        existingConversation.conversation_id,
        userId
      );

    const recipientMembership =
      await findDirectConversationMember(
        existingConversation.conversation_id,
        recipientUserId
      );

    if (!senderMembership) {
      await rejoinDirectConversationMember({
        conversationId:
          existingConversation.conversation_id,
        userId,
        visibleName: senderCommunity.visibleName,
        identityMode: senderCommunity.identityMode,
      });
    }

    if (!recipientMembership) {
      await rejoinDirectConversationMember({
        conversationId:
          existingConversation.conversation_id,
        userId: recipientUserId,
        visibleName: recipientCommunity.visibleName,
        identityMode: recipientCommunity.identityMode,
      });
    }

    return {
      conversation: existingConversation,
      created: false,
    };
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const conversationResult = await client.query(
      `
        INSERT INTO direct_conversations (
          conversation_type,
          is_active,
          last_activity_at,
          created_at,
          updated_at
        )
        VALUES (
          'direct',
          TRUE,
          NOW(),
          NOW(),
          NOW()
        )
        RETURNING *
      `
    );

    const conversation = conversationResult.rows[0];

    await client.query(
      `
        INSERT INTO direct_conversation_members (
          conversation_id,
          user_id,
          visible_name,
          identity_mode,
          is_muted,
          is_removed,
          joined_at,
          last_read_at
        )
        VALUES
          ($1, $2, $3, $4, FALSE, FALSE, NOW(), NOW()),
          ($1, $5, $6, $7, FALSE, FALSE, NOW(), NULL)
      `,
      [
        conversation.conversation_id,

        userId,
        senderCommunity.visibleName,
        senderCommunity.identityMode,

        recipientUserId,
        recipientCommunity.visibleName,
        recipientCommunity.identityMode,
      ]
    );

    await client.query("COMMIT");

    return {
      conversation,
      created: true,
    };
  } catch (error) {
    await client.query("ROLLBACK");

    /*
     * If two requests create the same conversation at nearly the
     * same time, return the conversation created by the other request.
     */
    if (error.code === "23505") {
      const conversation =
        await findDirectConversationBetweenUsers(
          userId,
          recipientUserId
        );

      if (conversation) {
        return {
          conversation,
          created: false,
        };
      }
    }

    throw error;
  } finally {
    client.release();
  }
}

/**
 * Return one conversation with its members.
 */
export async function getDirectConversationDetails({
  conversationId,
  userId,
}) {
  const conversation =
    await requireDirectConversation(conversationId);

  const membership = await requireConversationMember(
    conversationId,
    userId
  );

  const members =
    await findDirectConversationMembers(conversationId);

  const otherMember = members.find(
    (member) => member.user_id !== userId
  );

  return {
    conversation,
    membership,
    members,
    other_member: otherMember || null,
  };
}

/**
 * List the authenticated user's direct conversations.
 */
export async function listMyDirectConversations({
  userId,
  limit = 30,
  offset = 0,
}) {
  const normalizedLimit = Math.min(
    Math.max(Number(limit) || 30, 1),
    100
  );

  const normalizedOffset = Math.max(
    Number(offset) || 0,
    0
  );

  return findDirectConversationsForUser({
    userId,
    limit: normalizedLimit,
    offset: normalizedOffset,
  });
}

/**
 * Verify access to a conversation.
 *
 * This helper can be reused by the direct-message service
 * and Socket.IO handlers.
 */
export async function verifyDirectConversationAccess({
  conversationId,
  userId,
}) {
  const conversation =
    await requireDirectConversation(conversationId);

  const membership = await requireConversationMember(
    conversationId,
    userId
  );

  if (membership.is_removed) {
    throw createServiceError(
      "You were removed from this conversation.",
      403,
      "DIRECT_CONVERSATION_MEMBER_REMOVED"
    );
  }

  if (membership.left_at) {
    throw createServiceError(
      "You have left this conversation.",
      403,
      "DIRECT_CONVERSATION_MEMBER_LEFT"
    );
  }

  return {
    conversation,
    membership,
  };
}

/**
 * Mark a direct conversation as read.
 */
export async function markDirectConversationAsRead({
  conversationId,
  userId,
}) {
  await verifyDirectConversationAccess({
    conversationId,
    userId,
  });

  const readStatus =
    await updateDirectConversationLastRead(
      conversationId,
      userId
    );

  return {
    conversation_id: conversationId,
    user_id: userId,
    last_read_at: readStatus?.last_read_at || new Date(),
  };
}

/**
 * Refresh the stored display identity for a conversation member.
 *
 * This is useful if the user changes between anonymous
 * and registered identity mode.
 */
export async function refreshDirectConversationIdentity({
  conversationId,
  userId,
}) {
  await verifyDirectConversationAccess({
    conversationId,
    userId,
  });

  const community =
    await getActiveCommunityIdentity(userId);

  const result = await pool.query(
    `
      UPDATE direct_conversation_members
      SET
        visible_name = $3,
        identity_mode = $4,
        updated_at = NOW()
      WHERE conversation_id = $1
        AND user_id = $2
        AND is_removed = FALSE
      RETURNING *
    `,
    [
      conversationId,
      userId,
      community.visibleName,
      community.identityMode,
    ]
  );

  return result.rows[0] || null;
}

/**
 * Mute or unmute a direct conversation for the current user.
 *
 * This only controls notifications. It does not prevent messages.
 */
export async function setDirectConversationMute({
  conversationId,
  userId,
  isMuted,
}) {
  await verifyDirectConversationAccess({
    conversationId,
    userId,
  });

  const result = await pool.query(
    `
      UPDATE direct_conversation_members
      SET
        is_muted = $3,
        updated_at = NOW()
      WHERE conversation_id = $1
        AND user_id = $2
        AND is_removed = FALSE
      RETURNING *
    `,
    [
      conversationId,
      userId,
      Boolean(isMuted),
    ]
  );

  return result.rows[0] || null;
}

/**
 * Leave a direct conversation.
 */
export async function leaveDirectConversation({
  conversationId,
  userId,
}) {
  const { conversation } =
    await verifyDirectConversationAccess({
      conversationId,
      userId,
    });

  const membership =
    await leaveDirectConversationMember(
      conversationId,
      userId
    );

  const members =
    await findDirectConversationMembers(conversationId);

  const activeMembers = members.filter(
    (member) =>
      !member.left_at &&
      !member.is_removed &&
      member.user_id !== userId
  );

  /*
   * A direct conversation is deactivated when no active
   * participant remains.
   */
  if (activeMembers.length === 0) {
    await deactivateDirectConversation(conversationId);

    return {
      conversation,
      membership,
      left: true,
      conversation_deactivated: true,
    };
  }

  return {
    conversation,
    membership,
    left: true,
    conversation_deactivated: false,
  };
}

/**
 * Rejoin an existing conversation.
 */
export async function rejoinDirectConversation({
  conversationId,
  userId,
}) {
  const conversation =
    await findDirectConversationById(conversationId);

  if (!conversation) {
    throw createServiceError(
      "Direct conversation not found.",
      404,
      "DIRECT_CONVERSATION_NOT_FOUND"
    );
  }

  const community =
    await getActiveCommunityIdentity(userId);

  const members =
    await findDirectConversationMembers(conversationId);

  const wasPreviouslyMember = members.some(
    (member) => member.user_id === userId
  );

  if (!wasPreviouslyMember) {
    throw createServiceError(
      "You were never a participant in this conversation.",
      403,
      "DIRECT_CONVERSATION_REJOIN_FORBIDDEN"
    );
  }

  const membership =
    await rejoinDirectConversationMember({
      conversationId,
      userId,
      visibleName: community.visibleName,
      identityMode: community.identityMode,
    });

  if (!conversation.is_active) {
    const result = await pool.query(
      `
        UPDATE direct_conversations
        SET
          is_active = TRUE,
          last_activity_at = NOW(),
          updated_at = NOW()
        WHERE conversation_id = $1
        RETURNING *
      `,
      [conversationId]
    );

    return {
      conversation: result.rows[0],
      membership,
      rejoined: true,
    };
  }

  return {
    conversation,
    membership,
    rejoined: true,
  };
}

/**
 * Update the conversation activity timestamp.
 *
 * The message service will call this after sending,
 * editing or deleting a direct message.
 */
export async function touchDirectConversation(
  conversationId
) {
  const conversation =
    await requireDirectConversation(conversationId);

  await updateDirectConversationLastActivity(
    conversationId
  );

  return conversation;
}