
export default function DashboardHeader({ user_data, date }: { user_data: { username: string } | null, date: Date }) {
return (
    <div className="w-full flex mt-4 mb-8">
        <div className="mb-4 text-lg">Hello 
            {user_data && (
            <strong> {user_data.username.charAt(0).toUpperCase() + user_data.username.slice(1)}</strong>
            )} 👋  
            <span> - {date.toLocaleDateString("en", { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' })}</span>
        </div>
    </div>
)
}