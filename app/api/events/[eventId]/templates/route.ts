import { listEventTemplates, saveEventAsTemplate } from '@/lib/server/features/templates/api';
import { jsonError } from '@/lib/errors';
import { TemplateSchema } from '@/schemas/template';

export async function GET() {
  try {
    const templates = await listEventTemplates();
    return Response.json(templates);
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(
  req: Request,
  context: { params: Promise<{ eventId: string }> } 
) {
  try {
    const { eventId } = await context.params; 
    
    const body = await req.json();
    const validatedData = TemplateSchema.parse(body);
    const created = await saveEventAsTemplate(eventId, validatedData);
    
    return Response.json(created, { status: 201 });
    
  } catch (e) {
    return jsonError(e);
  }
}