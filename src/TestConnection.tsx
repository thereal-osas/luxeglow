import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

export default function TestConnection() {
    const [results, setResults] = useState<Record<string, any>>({});

    useEffect(() => {
        async function runTests() {
            // 1. Auth check
            const { data: { session } } = await supabase.auth.getSession();

            // 2. Services table
            const { data: services, error: svcErr } = await supabase
                .from('services').select('name').limit(3);

            // 3. Stylists table
            const { data: stylists, error: styErr } = await supabase
                .from('stylists').select('name').limit(3);

            // 4. Profiles table
            const { data: profiles, error: profErr } = await supabase
                .from('profiles').select('id').limit(1);

            setResults({
                connection: !svcErr ? '✅ Connected' : `❌ ${svcErr.message}`,
                services: services?.length ? `✅ ${services.map(s => s.name).join(', ')}` : `❌ ${svcErr?.message ?? 'No data'}`,
                stylists: stylists?.length ? `✅ ${stylists.map(s => s.name).join(', ')}` : `❌ ${styErr?.message ?? 'No data'}`,
                profiles: !profErr ? `✅ Table accessible` : `❌ ${profErr.message}`,
                session: session ? `✅ Logged in as ${session.user.email}` : '— No active session',
            });
        }

        runTests();
    }, []);

    return (
        <div style={{ fontFamily: 'monospace', padding: 32, background: '#0d0c0a', color: '#e8e7e4', minHeight: '100vh' }}>
            <h2 style={{ color: '#c99318', marginBottom: 24 }}>Supabase Connection Test</h2>
            {Object.keys(results).length === 0 ? (
                <p>Running tests...</p>
            ) : (
                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                    <tbody>
                        {Object.entries(results).map(([key, value]) => (
                            <tr key={key} style={{ borderBottom: '1px solid #44403c' }}>
                                <td style={{ padding: '10px 16px', color: '#747068', textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.2em' }}>{key}</td>
                                <td style={{ padding: '10px 16px', fontSize: 13 }}>{String(value)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}