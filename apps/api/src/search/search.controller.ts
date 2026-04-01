import {
  Controller,
  Get,
  Query,
  UseGuards
} from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { SearchService, SearchResults, SearchFilters } from "./search.service";

@Controller("search")
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  /**
   * Global search across all entity types
   * GET /search?q=query&types=project,organization&industry=fintech&limit=20
   */
  @Get()
  async search(
    @Query("q") query: string,
    @Query("types") types?: string,
    @Query("industry") industry?: string,
    @Query("stage") stage?: string,
    @Query("funding_min") fundingMin?: string,
    @Query("funding_max") fundingMax?: string,
    @Query("iec_level") iecLevel?: string,
    @Query("verified") verified?: string,
    @Query("limit") limit?: string
  ): Promise<SearchResults> {
    if (!query || query.trim().length < 2) {
      return {
        query: query ?? "",
        total: 0,
        results: [],
        groups: {
          projects: [],
          organizations: [],
          services: [],
          investors: [],
          startups: []
        }
      };
    }

    const filters: SearchFilters = {};

    if (types) {
      filters.types = types.split(",").filter(Boolean) as SearchFilters["types"];
    }
    if (industry) {
      filters.industry = industry;
    }
    if (stage) {
      filters.stage = stage;
    }
    if (fundingMin) {
      filters.fundingMin = parseFloat(fundingMin);
    }
    if (fundingMax) {
      filters.fundingMax = parseFloat(fundingMax);
    }
    if (iecLevel) {
      filters.iecLevel = iecLevel;
    }
    if (verified !== undefined) {
      filters.verified = verified === "true";
    }

    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.searchService.search(query.trim(), filters, limitNum);
  }

  /**
   * Get search suggestions for autocomplete
   * GET /search/suggestions?q=partial
   */
  @Get("suggestions")
  async getSuggestions(
    @Query("q") query: string,
    @Query("limit") limit?: string
  ): Promise<{ suggestions: string[] }> {
    if (!query || query.trim().length < 2) {
      return { suggestions: [] };
    }

    const limitNum = limit ? parseInt(limit, 10) : 10;
    const suggestions = await this.searchService.getSuggestions(query.trim(), limitNum);
    return { suggestions };
  }

  /**
   * Get trending search terms
   * GET /search/trending
   */
  @Get("trending")
  async getTrending(): Promise<{ trending: string[] }> {
    const trending = await this.searchService.getTrending();
    return { trending };
  }
}
