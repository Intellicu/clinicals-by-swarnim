import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const names = [];
        let skip = 0;
        const pageSize = 100;
        while (true) {
            const page = await base44.asServiceRole.entities.Drug.list('generic_name', pageSize, skip);
            if (!page || page.length === 0) break;
            for (const d of page) {
                names.push(d.generic_name);
            }
            if (page.length < pageSize) break;
            skip += pageSize;
        }

        const unique = [...new Set(names)].sort();
        let body = {};
        try { body = await req.json(); } catch { body = {}; }
        const q = body.q || 1;
        const size = Math.ceil(unique.length / 4);
        const slice = unique.slice((q - 1) * size, q * size);
        return Response.json({ count: unique.length, q, list: slice.join(' | ') });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});