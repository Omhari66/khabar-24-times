import crypto from "crypto";

export class SocialPostService {
  private get baseUrl() {
    return process.env.NEXT_PUBLIC_SITE_URL || "https://khabar24times.in";
  }

  private percentEncode(str: string): string {
    return encodeURIComponent(str)
      .replace(/!/g, "%21")
      .replace(/'/g, "%27")
      .replace(/\(/g, "%28")
      .replace(/\)/g, "%29")
      .replace(/\*/g, "%2A");
  }

  private generateTwitterOAuthHeader(
    method: string,
    url: string,
    bodyParams: Record<string, string> = {}
  ): string {
    const consumerKey = process.env.TWITTER_API_KEY;
    const consumerSecret = process.env.TWITTER_API_SECRET;
    const accessToken = process.env.TWITTER_ACCESS_TOKEN;
    const tokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;

    if (!consumerKey || !consumerSecret || !accessToken || !tokenSecret) {
      throw new Error("Missing Twitter OAuth credentials in environment");
    }

    const oauthParams: Record<string, string> = {
      oauth_consumer_key: consumerKey,
      oauth_nonce: crypto.randomBytes(16).toString("hex"),
      oauth_signature_method: "HMAC-SHA1",
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_token: accessToken,
      oauth_version: "1.0",
    };

    // Combine parameters (Twitter v2 payload is JSON, so we sign empty bodyParams)
    const allParams = { ...oauthParams, ...bodyParams };

    // Sort parameters alphabetically by key
    const sortedKeys = Object.keys(allParams).sort();
    const parameterString = sortedKeys
      .map((key) => `${this.percentEncode(key)}=${this.percentEncode(allParams[key])}`)
      .join("&");

    // Create signature base string
    const signatureBaseString = [
      method.toUpperCase(),
      this.percentEncode(url),
      this.percentEncode(parameterString),
    ].join("&");

    // Create signing key
    const signingKey = [
      this.percentEncode(consumerSecret),
      this.percentEncode(tokenSecret),
    ].join("&");

    // Calculate HMAC-SHA1 signature
    const signature = crypto
      .createHmac("sha1", signingKey)
      .update(signatureBaseString)
      .digest("base64");

    // Construct Authorization header
    oauthParams.oauth_signature = signature;
    const headerKeys = Object.keys(oauthParams).sort();
    return (
      "OAuth " +
      headerKeys
        .map((key) => `${this.percentEncode(key)}="${this.percentEncode(oauthParams[key])}"`)
        .join(", ")
    );
  }

  async postToFacebook(title: string, slug: string) {
    const pageId = process.env.FACEBOOK_PAGE_ID;
    const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

    if (!pageId || !accessToken) {
      console.warn("[SocialPostService] Facebook credentials missing. Skipping Facebook auto-post.");
      return;
    }

    const articleUrl = `${this.baseUrl}/article/${slug}`;
    const message = `${title}\n\nRead more: ${articleUrl}`;

    try {
      const fbUrl = `https://graph.facebook.com/v19.0/${pageId}/feed`;
      const response = await fetch(fbUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          link: articleUrl,
          access_token: accessToken,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to post to Facebook");
      }
      console.log(`[SocialPostService] Successfully posted to Facebook:`, data);
      return data;
    } catch (error) {
      console.error("[SocialPostService] Facebook Auto-Post Error:", error);
    }
  }

  async postToTwitter(title: string, slug: string) {
    const consumerKey = process.env.TWITTER_API_KEY;
    const accessToken = process.env.TWITTER_ACCESS_TOKEN;

    if (!consumerKey || !accessToken) {
      console.warn("[SocialPostService] Twitter credentials missing. Skipping Twitter auto-post.");
      return;
    }

    const articleUrl = `${this.baseUrl}/article/${slug}`;
    const text = `${title}\n\nRead more: ${articleUrl}`;

    try {
      const url = "https://api.twitter.com/2/tweets";
      const oauthHeader = this.generateTwitterOAuthHeader("POST", url);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: oauthHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(JSON.stringify(data));
      }
      console.log(`[SocialPostService] Successfully posted to Twitter:`, data);
      return data;
    } catch (error) {
      console.error("[SocialPostService] Twitter Auto-Post Error:", error);
    }
  }

  async autoPost(title: string, slug: string) {
    // Run posts in parallel (non-blocking)
    await Promise.allSettled([
      this.postToFacebook(title, slug),
      this.postToTwitter(title, slug),
    ]);
  }
}

export const socialPostService = new SocialPostService();
