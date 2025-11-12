Deno.serve(async (req) => {
    return new Response(
        JSON.stringify({ message: "Hello from test function", timestamp: new Date().toISOString() }),
        { headers: { "Content-Type": "application/json" } }
    );
});
