export async function POST(req: Request) {
    try {
      const body = await req.json().catch(() => ({} as any));
      const spec = body?.spec;
  
      if (typeof spec !== "string" || !spec.trim()) {
        return new Response(
          JSON.stringify({ error: "Spec is required" }),
          { status: 400 }
        );
      }
  
      const url = process.env.NEXT_PUBLIC_N8N_GENERATE_TICKETS_URL;
  
      if (!url) {
        console.error("NEXT_PUBLIC_N8N_GENERATE_TICKETS_URL is not set");
        return new Response(
          JSON.stringify({ error: "NEXT_PUBLIC_N8N_GENERATE_TICKETS_URL is not set" }),
          { status: 500 }
        );
      }
  
      console.log("Calling n8n:", url);
  
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spec }),
      });
  
      const data = await res.json().catch(() => ({}));
  
      if (!res.ok) {
        console.error("n8n error:", res.status, data);
        return new Response(
          JSON.stringify({
            error:
              data.error ||
              `n8n returned ${res.status} from ${url}`,
          }),
          { status: res.status }
        );
      }
  
      // success – just pass back what n8n responded with
      return new Response(JSON.stringify(data), { status: 200 });
    } catch (error: any) {
      console.error("Unhandled /api/generate error:", error);
      return new Response(
        JSON.stringify({
          error:
            error?.message ||
            "Internal server error in /api/generate",
        }),
        { status: 500 }
      );
    }
  }
  