Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Max-Age': '86400',
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            throw new Error('Missing authorization header');
        }

        const token = authHeader.replace('Bearer ', '');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Supabase configuration missing');
        }

        // 验证用户token
        const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
                'Authorization': authHeader,
                'apikey': serviceRoleKey
            }
        });

        if (!userResponse.ok) {
            throw new Error('Invalid token');
        }

        const userData = await userResponse.json();
        const userId = userData.id;
        const userEmail = userData.email;

        console.log('Getting role for user:', userEmail);

        // 查询用户角色信息
        const profileResponse = await fetch(
            `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=id,full_name,role_id,roles(id,name,description)`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!profileResponse.ok) {
            const errorText = await profileResponse.text();
            console.error('Failed to fetch profile:', errorText);
            throw new Error('Failed to fetch user profile');
        }

        const profiles = await profileResponse.json();

        if (!profiles || profiles.length === 0) {
            console.error('No profile found for user:', userId);
            throw new Error('User profile not found');
        }

        const profile = profiles[0];

        // 确保roles数据存在
        if (!profile.roles) {
            console.error('No role data found for user:', userId);
            throw new Error('User role not found');
        }

        const result = {
            data: {
                user_id: profile.id,
                email: userEmail,
                full_name: profile.full_name || null,
                role: {
                    id: profile.roles.id,
                    name: profile.roles.name,
                    description: profile.roles.description
                }
            }
        };

        console.log('Successfully retrieved role:', profile.roles.name);

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
        });

    } catch (error) {
        console.error('Error in user-role function:', error);

        return new Response(
            JSON.stringify({
                error: {
                    code: 'USER_ROLE_ERROR',
                    message: error.message
                }
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500
            }
        );
    }
});
