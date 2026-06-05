/**
 * Decap CMS GitHub OAuth 回调处理
 * 处理 /api/auth 和 /api/auth/callback
 */
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // GitHub OAuth 配置
  const clientId = env.GITHUB_CLIENT_ID;
  const clientSecret = env.GITHUB_CLIENT_SECRET;
  const redirectUri = `${url.origin}/api/auth/callback`;
  const oauthOrigin = "https://github.com";
  const oauthAuthorizePath = "/login/oauth/authorize";
  const oauthAccessTokenPath = "/login/oauth/access_token";

  // 发起 OAuth 授权
  if (url.pathname === "/api/auth") {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "repo,user",
    });
    return Response.redirect(`${oauthOrigin}${oauthAuthorizePath}?${params}`, 302);
  }

  // OAuth 回调
  if (url.pathname === "/api/auth/callback") {
    const code = url.searchParams.get("code");
    if (!code) {
      return new Response("Missing code parameter", { status: 400 });
    }

    try {
      // 用 code 换取 access_token
      const tokenResponse = await fetch(
        `${oauthOrigin}${oauthAccessTokenPath}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            code,
          }),
        }
      );
      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        return new Response(
          `GitHub OAuth Error: ${tokenData.error_description || tokenData.error}`,
          { status: 400 }
        );
      }

      // 返回 HTML，将 token 传递给 Decap CMS
      const html = `<!DOCTYPE html>
<html><head><title>授权成功</title></head><body>
<script>
  window.opener.postMessage(
    { token: "${tokenData.access_token}", provider: "github" },
    window.location.origin
  );
  window.close();
</script>
<p>授权成功！窗口即将关闭...</p>
</body></html>`;

      return new Response(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    } catch (err) {
      return new Response(`OAuth 回调处理失败: ${err.message}`, { status: 500 });
    }
  }

  return new Response("Not Found", { status: 404 });
}
