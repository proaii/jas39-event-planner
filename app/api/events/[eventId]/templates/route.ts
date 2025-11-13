import { saveEventAsTemplate } from '@/lib/server/features/events/api';
import { jsonError } from '@/lib/errors';
import { TemplateSchema } from '@/schemas/template';

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