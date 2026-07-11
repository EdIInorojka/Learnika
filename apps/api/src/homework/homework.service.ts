import { Injectable, NotFoundException } from "@nestjs/common";
import type { HomeworkAttempt, HomeworkSession } from "@prisma/client";

import { AuthorizationService } from "../authorization/authorization.service";
import type { AuthorizedParentContext } from "../authorization/authorization.types";
import { PrismaService } from "../database/prisma.service";
import { HomeworkStateService } from "../homework-state/homework-state.service";
import type { CreateHomeworkAttemptInput, CreateHomeworkSessionInput } from "./homework.validation";
import type {
  HomeworkAttemptResponse,
  HomeworkAttemptsResponse,
  HomeworkAttemptSummary,
  HomeworkSessionResponse,
  HomeworkSessionsResponse,
  HomeworkSessionSummary,
} from "./homework.types";

@Injectable()
export class HomeworkService {
  constructor(
    private readonly authorization: AuthorizationService,
    private readonly homeworkState: HomeworkStateService,
    private readonly prisma: PrismaService,
  ) {}

  async createSession(
    context: AuthorizedParentContext,
    input: CreateHomeworkSessionInput,
  ): Promise<HomeworkSessionResponse> {
    const childContext = await this.authorization.requireChildAccess(
      context,
      input.childProfileId,
      "authorization.homework_session.child.access",
    );
    const session = await this.prisma.homeworkSession.create({
      data: {
        childProfileId: childContext.child.id,
        createdByUserId: context.user.id,
        familyId: childContext.familyId,
        gradeLevel: input.gradeLevel ?? childContext.child.gradeLevel,
        sourceType: input.sourceType,
        status: "CREATED",
        subject: input.subject,
      },
    });

    return { data: { session: this.toSessionSummary(session) } };
  }

  async listSessions(
    context: AuthorizedParentContext,
    childProfileId: string | undefined,
  ): Promise<HomeworkSessionsResponse> {
    const familyContext = childProfileId
      ? await this.authorization.requireChildAccess(
          context,
          childProfileId,
          "authorization.homework_session.child.list",
        )
      : await this.authorization.requireParentFamily(
          context,
          "authorization.homework_session.family.list",
        );
    const sessions = await this.prisma.homeworkSession.findMany({
      orderBy: { createdAt: "desc" },
      where: {
        archivedAt: null,
        familyId: familyContext.familyId,
        ...(childProfileId ? { childProfileId } : {}),
      },
    });

    return {
      data: {
        sessions: sessions.map((session) => this.toSessionSummary(session)),
      },
    };
  }

  async getSession(
    context: AuthorizedParentContext,
    homeworkSessionId: string,
  ): Promise<HomeworkSessionResponse> {
    const { session } = await this.requireSessionAccess(
      context,
      homeworkSessionId,
      "authorization.homework_session.read",
    );

    return { data: { session: this.toSessionSummary(session) } };
  }

  async createAttempt(
    context: AuthorizedParentContext,
    homeworkSessionId: string,
    input: CreateHomeworkAttemptInput,
  ): Promise<HomeworkAttemptResponse> {
    const { familyId, session } = await this.requireSessionAccess(
      context,
      homeworkSessionId,
      "authorization.homework_attempt.create_session.access",
    );
    const attempts = await this.prisma.homeworkAttempt.findMany({
      select: { attemptNumber: true },
      where: { familyId, homeworkSessionId: session.id },
    });
    const attemptNumber = this.homeworkState.nextAttemptNumber(attempts);
    const attemptMetadata = this.homeworkState.buildAttemptMetadata({
      attemptNumber,
      childProfileId: session.childProfileId,
      createdByUserId: context.user.id,
      familyId,
      homeworkSessionId: session.id,
      status: input.status,
    });
    const attempt = await this.prisma.homeworkAttempt.create({
      data: attemptMetadata,
    });

    return { data: { attempt: this.toAttemptSummary(attempt) } };
  }

  async listAttempts(
    context: AuthorizedParentContext,
    homeworkSessionId: string,
  ): Promise<HomeworkAttemptsResponse> {
    const { familyId, session } = await this.requireSessionAccess(
      context,
      homeworkSessionId,
      "authorization.homework_attempt.list_session.access",
    );
    const attempts = await this.prisma.homeworkAttempt.findMany({
      orderBy: { attemptNumber: "asc" },
      where: {
        familyId,
        homeworkSessionId: session.id,
      },
    });

    return {
      data: {
        attempts: attempts.map((attempt) => this.toAttemptSummary(attempt)),
      },
    };
  }

  private async requireSessionAccess(
    context: AuthorizedParentContext,
    homeworkSessionId: string,
    action: string,
  ): Promise<{ familyId: string; session: HomeworkSession }> {
    const familyContext = await this.authorization.requireParentFamily(context, action);
    const session = await this.prisma.homeworkSession.findFirst({
      where: {
        archivedAt: null,
        familyId: familyContext.familyId,
        id: homeworkSessionId,
      },
    });

    if (!session) {
      await this.authorization.recordDeniedAccess({
        action,
        familyId: familyContext.familyId,
        targetId: homeworkSessionId,
        targetType: "HomeworkSession",
        userId: context.user.id,
      });
      throw new NotFoundException({
        code: "AUTHZ_RESOURCE_NOT_FOUND",
        message: "Resource was not found.",
      });
    }

    return { familyId: familyContext.familyId, session };
  }

  private toSessionSummary(session: HomeworkSession): HomeworkSessionSummary {
    return {
      archivedAt: session.archivedAt?.toISOString() ?? null,
      childProfileId: session.childProfileId,
      createdAt: session.createdAt.toISOString(),
      createdByUserId: session.createdByUserId,
      familyId: session.familyId,
      gradeLevel: session.gradeLevel,
      id: session.id,
      sourceType: session.sourceType,
      status: session.status,
      subject: session.subject as "math",
      updatedAt: session.updatedAt.toISOString(),
    };
  }

  private toAttemptSummary(attempt: HomeworkAttempt): HomeworkAttemptSummary {
    return {
      attemptNumber: attempt.attemptNumber,
      childProfileId: attempt.childProfileId,
      createdAt: attempt.createdAt.toISOString(),
      createdByUserId: attempt.createdByUserId,
      familyId: attempt.familyId,
      homeworkSessionId: attempt.homeworkSessionId,
      id: attempt.id,
      status: attempt.status,
      updatedAt: attempt.updatedAt.toISOString(),
    };
  }
}
