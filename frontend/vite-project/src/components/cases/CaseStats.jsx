export default function CaseStats({
    cases = [],
    onStatusClick,
}){

    const total = cases.length;

    const countBy = (status) => cases.filter(item => item.status === status).length;

    const open = countBy("OPEN");
    const inProgress = countBy("IN_PROGRESS");
    const pending = countBy("PENDING");
    const escalated = countBy("ESCALATED");
    const resolved = countBy("RESOLVED");
    const customerConfirmation = countBy("CUSTOMER_CONFIRMATION");
    const closed = countBy("CLOSED");


    return (

        <div
        className="
        grid
        grid-cols-1
        md:grid-cols-4
        gap-6
        "
        >

            <Card title="Total Cases" value={total} onClick={() => onStatusClick?.(null)} />

            <Card title="Open" value={open} onClick={() => onStatusClick?.("OPEN")} />

            <Card title="In Progress" value={inProgress} onClick={() => onStatusClick?.("IN_PROGRESS")} />

            <Card title="Pending" value={pending} onClick={() => onStatusClick?.("PENDING")} />

            <Card title="Escalated" value={escalated} onClick={() => onStatusClick?.("ESCALATED")} />

            <Card title="Resolved" value={resolved} onClick={() => onStatusClick?.("RESOLVED")} />

            <Card title="Awaiting Customer" value={customerConfirmation} onClick={() => onStatusClick?.("CUSTOMER_CONFIRMATION")} />

            <Card title="Closed" value={closed} onClick={() => onStatusClick?.("CLOSED")} />


        </div>

    );

}


function Card({
    title,
    value,
    onClick
}){

return (

<div
className="
bg-white
rounded-lg
border
border-navy-100
p-6
shadow-sm
cursor-pointer
hover:shadow-md
"
onClick={onClick}
>

<h3
className="
text-gray-500
font-semibold
"
>

{title}

</h3>


<h1
className="
text-4xl
font-bold
text-navy-900
mt-3
"
>

{value}

</h1>

</div>

);


}
