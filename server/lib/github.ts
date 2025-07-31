/**
 * GitHub integration service for Judge Finder
 * This can be used for:
 * - Storing case data and legal documents
 * - Version controlling judge profile updates
 * - Backing up database content
 * - Managing user-generated content
 */

interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
}

export class GitHubService {
  private config: GitHubConfig;

  constructor(config: GitHubConfig) {
    this.config = config;
  }

  /**
   * Create a new file in the repository
   */
  async createFile(
    path: string,
    content: string,
    message: string,
  ): Promise<any> {
    const url = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents/${path}`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `token ${this.config.token}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github.v3+json",
      },
      body: JSON.stringify({
        message,
        content: Buffer.from(content).toString("base64"),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create file: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update an existing file in the repository
   */
  async updateFile(
    path: string,
    content: string,
    message: string,
    sha: string,
  ): Promise<any> {
    const url = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents/${path}`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `token ${this.config.token}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github.v3+json",
      },
      body: JSON.stringify({
        message,
        content: Buffer.from(content).toString("base64"),
        sha,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update file: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get file content from the repository
   */
  async getFile(path: string): Promise<any> {
    const url = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents/${path}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `token ${this.config.token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null; // File doesn't exist
      }
      throw new Error(`Failed to get file: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      ...data,
      content: Buffer.from(data.content, "base64").toString("utf8"),
    };
  }

  /**
   * Backup judge data to GitHub repository
   */
  async backupJudgeData(judgeData: any): Promise<void> {
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `backups/judges/judge-${judgeData.id}-${timestamp}.json`;
    const content = JSON.stringify(judgeData, null, 2);
    const message = `Backup judge data for ${judgeData.name}`;

    try {
      // Try to get existing file
      const existingFile = await this.getFile(filename);

      if (existingFile) {
        // Update existing file
        await this.updateFile(filename, content, message, existingFile.sha);
      } else {
        // Create new file
        await this.createFile(filename, content, message);
      }
    } catch (error) {
      console.error("Failed to backup judge data to GitHub:", error);
      throw error;
    }
  }

  /**
   * Store case documents or legal files
   */
  async storeCaseDocument(
    judgeId: number,
    caseTitle: string,
    document: string,
  ): Promise<void> {
    const sanitizedTitle = caseTitle.replace(/[^a-zA-Z0-9]/g, "-");
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `cases/judge-${judgeId}/${sanitizedTitle}-${timestamp}.md`;
    const message = `Add case document: ${caseTitle}`;

    await this.createFile(filename, document, message);
  }
}

/**
 * Factory function to create GitHub service instance
 */
export function createGitHubService(): GitHubService | null {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_REPO_OWNER;
  const repo = process.env.GITHUB_REPO_NAME;

  if (!token || !owner || !repo) {
    console.warn(
      "GitHub integration not configured. Set GITHUB_TOKEN, GITHUB_REPO_OWNER, and GITHUB_REPO_NAME environment variables.",
    );
    return null;
  }

  return new GitHubService({ token, owner, repo });
}
