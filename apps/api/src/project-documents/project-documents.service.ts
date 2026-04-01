import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type { ProjectDocument, ProjectDocumentType } from "@iec-hub/shared";
import { PrismaService } from "../prisma/prisma.service";
import { randomUUID } from "crypto";

@Injectable()
export class ProjectDocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  private mapDbDocument(db: any): ProjectDocument {
    return {
      id: db.id,
      org_id: db.org_id ?? null,
      created_at: db.created_at.toISOString(),
      updated_at: db.updated_at.toISOString(),
      created_by: db.created_by ?? null,
      project_id: db.project_id,
      type: db.type,
      storage_path: db.storage_path,
      file_name: db.title,
      mime_type: db.mime_type,
      file_size: db.file_size ?? null,
      is_public: false // DB schema doesn't have this field
    };
  }

  async createMetadata(
    projectId: string,
    type: ProjectDocumentType,
    fileName: string,
    mimeType: string,
    currentUserId: string
  ): Promise<ProjectDocument> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        startup_profile: true
      }
    });
    if (!project) {
      throw new NotFoundException("Project not found");
    }

    const startup = await this.prisma.startupProfile.findUnique({
      where: { user_id: currentUserId }
    });
    if (!startup || startup.id !== project.startup_id) {
      throw new ForbiddenException(
        "You are not allowed to add documents to this project"
      );
    }

    const created = await this.prisma.projectDocument.create({
      data: {
        id: randomUUID(),
        org_id: project.org_id,
        project_id: project.id,
        type,
        storage_path: `projects/${project.id}/${Date.now()}-${fileName}`,
        title: fileName,
        mime_type: mimeType
      }
    });

    // BRD rule: uploading/replacing core data room docs downgrades IEC level
    if (project.iec_level === "L1" || project.iec_level === "L3") {
      await this.prisma.project.update({
        where: { id: project.id },
        data: { iec_level: "L0" }
      });
    }

    return this.mapDbDocument(created);
  }

  async findByProject(projectId: string): Promise<ProjectDocument[]> {
    const docs = await this.prisma.projectDocument.findMany({
      where: { project_id: projectId },
      orderBy: { created_at: "desc" }
    });
    return docs.map((d) => this.mapDbDocument(d));
  }

  async findOne(id: string): Promise<ProjectDocument | null> {
    const doc = await this.prisma.projectDocument.findUnique({
      where: { id }
    });
    if (!doc) return null;
    return this.mapDbDocument(doc);
  }

  async update(
    id: string,
    patch: Partial<Pick<ProjectDocument, "type" | "is_public">>,
    currentUserId: string
  ): Promise<ProjectDocument> {
    const doc = await this.prisma.projectDocument.findUnique({
      where: { id },
      include: {
        project: true
      }
    });
    if (!doc) {
      throw new NotFoundException("Document not found");
    }

    const startup = await this.prisma.startupProfile.findUnique({
      where: { user_id: currentUserId }
    });
    if (!startup || startup.id !== doc.project.startup_id) {
      throw new ForbiddenException("You cannot update this document");
    }

    const updated = await this.prisma.projectDocument.update({
      where: { id },
      data: {
        type: patch.type ?? doc.type
      }
    });

    if (doc.project.iec_level === "L1" || doc.project.iec_level === "L3") {
      await this.prisma.project.update({
        where: { id: doc.project_id },
        data: { iec_level: "L0" }
      });
    }

    return this.mapDbDocument(updated);
  }

  async remove(id: string, currentUserId: string): Promise<void> {
    const doc = await this.prisma.projectDocument.findUnique({
      where: { id },
      include: {
        project: true
      }
    });
    if (!doc) {
      throw new NotFoundException("Document not found");
    }

    const startup = await this.prisma.startupProfile.findUnique({
      where: { user_id: currentUserId }
    });
    if (!startup || startup.id !== doc.project.startup_id) {
      throw new ForbiddenException("You cannot delete this document");
    }

    await this.prisma.projectDocument.delete({
      where: { id }
    });

    if (doc.project.iec_level === "L1" || doc.project.iec_level === "L3") {
      await this.prisma.project.update({
        where: { id: doc.project_id },
        data: { iec_level: "L0" }
      });
    }
  }
}

