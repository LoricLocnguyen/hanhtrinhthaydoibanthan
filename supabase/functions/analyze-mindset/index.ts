import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { journalEntries, dayLogs, urgeLogs } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `Bạn là chuyên gia tâm lý hành vi. Phân tích dữ liệu sau của một người đang trong hành trình cai nghiện và trả về JSON.

Dữ liệu nhật ký (journal entries):
${JSON.stringify(journalEntries?.slice(-30) || [], null, 2)}

Dữ liệu ngày (day logs - success=true nghĩa là ngày thành công):
${JSON.stringify(dayLogs?.slice(-30) || [], null, 2)}

Dữ liệu cơn thôi thúc (urge logs):
${JSON.stringify(urgeLogs?.slice(-30) || [], null, 2)}

Hãy phân tích và trả về kết quả.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: "Bạn là chuyên gia phân tích tâm lý hành vi nghiện. Phân tích dữ liệu và trả về insights hữu ích bằng tiếng Việt."
          },
          { role: "user", content: prompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_analysis",
              description: "Return the mindset analysis results",
              parameters: {
                type: "object",
                properties: {
                  topTriggers: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        frequency: { type: "number" },
                        advice: { type: "string" }
                      },
                      required: ["name", "frequency", "advice"]
                    },
                    description: "Top 5 triggers gây relapse hoặc cơn thôi thúc"
                  },
                  weakPeriods: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        period: { type: "string" },
                        riskLevel: { type: "string", enum: ["high", "medium", "low"] },
                        description: { type: "string" }
                      },
                      required: ["period", "riskLevel", "description"]
                    },
                    description: "Các khoảng thời gian nguy hiểm (thứ trong tuần, khung giờ)"
                  },
                  moodPattern: {
                    type: "string",
                    description: "Mô tả xu hướng tâm trạng tổng thể"
                  },
                  strengths: {
                    type: "array",
                    items: { type: "string" },
                    description: "Điểm mạnh của người dùng dựa trên dữ liệu"
                  },
                  personalAdvice: {
                    type: "string",
                    description: "Lời khuyên cá nhân hóa dựa trên dữ liệu (2-3 câu)"
                  },
                  weeklyWarning: {
                    type: "string",
                    description: "Cảnh báo cụ thể cho tuần tới dựa trên pattern, ví dụ: 'Chiều thứ 7 thường là lúc bạn dễ bỏ cuộc nhất'"
                  }
                },
                required: ["topTriggers", "weakPeriods", "moodPattern", "strengths", "personalAdvice", "weeklyWarning"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "return_analysis" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Hệ thống đang bận, vui lòng thử lại sau." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Cần nạp thêm credits để sử dụng AI." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-mindset error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
