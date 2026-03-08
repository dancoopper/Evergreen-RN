import { HabitTask, TaskCategory } from '../store/useStore';

const BACKBOARD_API_KEY = 'espr_TugcwiIYXlG6NkSlOi4ifDa2aQIPFJHMDkbroYepmeY';
const BASE_URL = 'https://app.backboard.io/api';

const SYSTEM_PROMPT = `You are a gentle, warm, and caring wellness coach for the Oasis app. You help people who may be going through a difficult time, including depression, anxiety, or low motivation. Your tone is always kind, patient, and encouraging — like a supportive friend who believes in them.

Your job is to generate 4-6 small, achievable daily tasks based on their goal. These tasks should feel like gentle invitations, not demands.

Rules:
- Frame each task as a small, manageable win — something they can feel proud of
- Use warm, encouraging language in descriptions (e.g. "You deserve this" or "Even a few minutes counts")
- Each task needs: a short "title" (2-4 words), a "description" (one warm sentence, MAX 50 characters), an "icon", and a "category"
- IMPORTANT: Keep descriptions SHORT — maximum 50 characters so they fit on screen
- Category must be one of: health, mind, social, environment
- Icon must be one of: water, bed, walk, sparkles, heart, book, sun, music
- Tasks should be doable in under 10 minutes, even on a hard day
- Return ONLY a valid JSON array, no markdown, no code fences, no explanation
- Make tasks directly tied to the stated goal
- Try to include at least one task from each category
- Remember: progress, not perfection. Every small step matters.

Example response:
[
  {{"title": "Morning Sip", "description": "A glass of water to start fresh", "icon": "water", "category": "health"}},
  {{"title": "Gentle Walk", "description": "Step outside for 5 minutes", "icon": "walk", "category": "health"}},
  {{"title": "Quick Journal", "description": "Write one thing you feel", "icon": "book", "category": "mind"}},
  {{"title": "Text a Friend", "description": "Say hi to someone you like", "icon": "heart", "category": "social"}}
]`;

// Create headers for Backboard API
function getHeaders() {
    return {
        'x-api-key': BACKBOARD_API_KEY,
        'Content-Type': 'application/json',
    };
}

// Validate category
function validateCategory(cat: string): TaskCategory {
    const valid: TaskCategory[] = ['health', 'mind', 'social', 'environment'];
    return valid.includes(cat as TaskCategory) ? (cat as TaskCategory) : 'mind';
}

// Generate tasks using Backboard's AI
export async function generateTasks(goal: string): Promise<HabitTask[]> {
    try {
        console.log('🤖 Generating AI tasks for goal:', goal);

        // Step 1: Create an assistant
        const assistantRes = await fetch(`${BASE_URL}/assistants`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                name: 'Oasis Task Generator',
                description: SYSTEM_PROMPT,
            }),
        });

        if (!assistantRes.ok) {
            const errorText = await assistantRes.text();
            console.error('Failed to create assistant:', assistantRes.status, errorText);
            throw new Error(`Assistant creation failed: ${assistantRes.status}`);
        }

        const assistant = await assistantRes.json();
        const assistantId = assistant.assistant_id;
        console.log('🤖 Assistant created:', assistantId);

        // Step 2: Create a thread
        const threadRes = await fetch(`${BASE_URL}/assistants/${assistantId}/threads`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({}),
        });

        if (!threadRes.ok) {
            const errorText = await threadRes.text();
            console.error('Failed to create thread:', threadRes.status, errorText);
            throw new Error(`Thread creation failed: ${threadRes.status}`);
        }

        const thread = await threadRes.json();
        const threadId = thread.thread_id;
        console.log('🤖 Thread created:', threadId);

        // Step 3: Send a message and get the AI response
        const messageRes = await fetch(`${BASE_URL}/threads/${threadId}/messages`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                content: `I'd like some gentle, encouraging daily tasks to help me with this goal: "${goal}". Each task needs a title, description (keep it under 50 characters), icon, and category (health, mind, social, or environment). Return ONLY a JSON array.`,
                assistant_id: assistantId,
            }),
        });

        if (!messageRes.ok) {
            const errorText = await messageRes.text();
            console.error('Failed to send message:', messageRes.status, errorText);
            throw new Error(`Message failed: ${messageRes.status}`);
        }

        const messageData = await messageRes.json();
        console.log('🤖 AI Raw Response:', JSON.stringify(messageData));

        if (messageData.status === 'FAILED') {
            console.error('AI message failed:', messageData.content);
            throw new Error(`AI generation failed: ${messageData.content}`);
        }

        const responseText = messageData.content || '';
        console.log('🤖 AI Content:', responseText);

        const tasksJson = extractJSON(responseText);

        if (tasksJson && Array.isArray(tasksJson)) {
            const tasks: HabitTask[] = tasksJson.map((task: any, index: number) => ({
                id: `ai_${Date.now()}_${index}`,
                title: task.title,
                description: task.description ? task.description.substring(0, 60) : '',
                icon: task.icon || 'sparkles',
                category: validateCategory(task.category || 'mind'),
                completed: false,
            }));

            console.log('✅ Generated', tasks.length, 'tasks');
            return tasks;
        }

        throw new Error('Could not parse AI response into tasks');
    } catch (error) {
        console.error('❌ Backboard AI error:', error);
        throw error;
    }
}

// Extract JSON array from a string that might contain extra text
function extractJSON(text: string): any[] | null {
    try {
        const parsed = JSON.parse(text);
        return Array.isArray(parsed) ? parsed : null;
    } catch {
        const match = text.match(/\[[\s\S]*\]/);
        if (match) {
            try {
                return JSON.parse(match[0]);
            } catch {
                return null;
            }
        }
        return null;
    }
}
