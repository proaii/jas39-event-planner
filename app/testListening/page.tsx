import { RealtimeLoggerTasks, RealtimeLoggerEvents } from "@/components/realtime/testRealtime"

export default async function TestPage() {
    return (
        <div>
            
            <div><RealtimeLoggerEvents /></div>
            <div><RealtimeLoggerTasks /></div>
        
        </div>
    )
}