import { ProjectsService } from "./projects.service";

describe("ProjectsService", () => {
  it("returns empty list when user has no startup profile", async () => {
    const prisma: any = {
      startupProfile: {
        findUnique: jest.fn().mockResolvedValue(null)
      }
    };
    const service = new ProjectsService(prisma);
    const result = await service.findAllForStartup("user-1");
    expect(result).toEqual([]);
  });
});

