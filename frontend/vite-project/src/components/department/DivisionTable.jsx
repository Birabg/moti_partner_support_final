import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { useState } from "react";

import {
  FaEdit,
  FaCheck,
  FaBan,
  FaSave,
  FaTimes,
} from "react-icons/fa";


export default function DivisionTable({
  divisions = [],
  onUpdate,
  onDeactivate,
  onReactivate,
}) {


  const [editingId,setEditingId] = useState(null);
  const [editingName,setEditingName] = useState("");



  function startEdit(division){

    setEditingId(division.id);
    setEditingName(division.name);

  }



  function cancelEdit(){

    setEditingId(null);
    setEditingName("");

  }



  async function saveEdit(id){

    if(!editingName.trim()) return;


    await onUpdate(id,{
      name:editingName
    });


    cancelEdit();

  }




  return (

    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">


      <div className="overflow-x-auto">


        <Table className="min-w-full">


          <TableHeader>


            <TableRow>


              <TableHead className="px-5 py-4 text-left">
                #
              </TableHead>


              <TableHead className="px-5 py-4 text-left">
                Division
              </TableHead>


              <TableHead className="px-5 py-4 text-left">
                Department
              </TableHead>


              <TableHead className="px-5 py-4 text-center">
                Sections
              </TableHead>


              <TableHead className="px-5 py-4 text-center">
                Status
              </TableHead>


              <TableHead className="px-5 py-4 text-center">
                Actions
              </TableHead>


            </TableRow>


          </TableHeader>



          <TableBody>


          {divisions.map((division,index)=>(


            <TableRow
              key={division.id}
              className="border-b hover:bg-gray-50"
            >


              <TableCell className="px-5 py-4">
                {index+1}
              </TableCell>



              <TableCell className="px-5 py-4">


                {editingId===division.id ? (


                  <input
                    value={editingName}
                    onChange={(e)=>setEditingName(e.target.value)}
                    className="border rounded-lg px-3 py-2"
                  />


                ):(


                  <span className="font-medium">
                    {division.name}
                  </span>


                )}


              </TableCell>




              <TableCell className="px-5 py-4">


                {division.department?.name || "N/A"}


              </TableCell>




              <TableCell className="px-5 py-4 text-center">


                {division._count?.sections ?? 0}


              </TableCell>




              <TableCell className="px-5 py-4 text-center">


                {division.isActive ? (

                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                    Active
                  </span>

                ):(

                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                    Inactive
                  </span>

                )}


              </TableCell>




              <TableCell className="px-5 py-4">


                <div className="flex justify-center gap-2">



                {editingId===division.id ? (


                  <>


                    <button
                      onClick={()=>saveEdit(division.id)}
                      className="bg-green-600 text-white p-2 rounded-lg"
                    >
                      <FaSave/>
                    </button>



                    <button
                      onClick={cancelEdit}
                      className="bg-gray-500 text-white p-2 rounded-lg"
                    >
                      <FaTimes/>
                    </button>


                  </>


                ):(


                  <>


                    <div className="relative group">

<button
  onClick={()=>startEdit(division)}
  className="bg-navy-600 hover:bg-navy-700 text-white p-2 rounded-lg"
>
  <FaEdit />
</button>

<span className="absolute bottom-full mb-2 hidden group-hover:block 
bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
  Edit
</span>

</div>


                    {
                      division.isActive ? (

                        <div className="relative group">

<button
 onClick={()=>onDeactivate(division.id)}
 className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg"
>
 <FaBan/>
</button>


<span className="absolute bottom-full mb-2 hidden group-hover:block 
bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
 Deactivate
</span>

</div>


                      ):(


                        <div className="relative group">

<button
 onClick={()=>onReactivate(division.id)}
 className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg"
>
 <FaCheck/>
</button>

<span className="absolute bottom-full mb-2 hidden group-hover:block 
bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
 Reactivate
</span>

</div>

                      )
                    }


                  </>


                )}


                </div>


              </TableCell>



            </TableRow>


          ))}



          {divisions.length===0 && (

            <TableRow>

              <TableCell
                colSpan="6"
                className="text-center py-10 text-gray-500"
              >
                No divisions found.
              </TableCell>

            </TableRow>

          )}


          </TableBody>


        </Table>


      </div>


    </div>

  );

}