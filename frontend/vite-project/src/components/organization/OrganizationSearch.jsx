import { FaSearch } from "react-icons/fa";


export default function OrganizationSearch({

    search,
    setSearch,

}){

    return(

        <div
        className="
        bg-white
        rounded-lg
        shadow-lg
        p-4
        flex
        items-center
        gap-4
        "
        >

            <FaSearch
            className="
            text-gray-400
            "
            />


            <input

            value={search}

            placeholder="Search organizations...."

            onChange={(e)=>

                setSearch(
                    e.target.value
                )

            }

            className="
            w-full
            outline-none
            "

            />

        </div>

    );

}