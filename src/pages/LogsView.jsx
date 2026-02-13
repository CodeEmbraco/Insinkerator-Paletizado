import LogsTable from "../partials/logs/LogsTable";

function LogsView(){
    const handleSelectedItems = (selectedItems) => {
        setSelectedItems([...selectedItems]);
      };
    return (
        <>
        
        <div className="px-4 sm:px-6 lg:px-8 py-2 w-full max-w-10xl mx-auto">
        <div className="max-w-full mx-4 py-0 sm:mx-auto sm:px-6 lg:px-4">
          <header>
            <div className="mt-8">
              <div className="flex items-center justify-between h-16 -mb-px">
                <h3 className="text-black text-2xl capitalize font-semibold text-gray-400 tracking-tight">
                  Logs
                </h3>
                </div>
                </div>
                </header>
                </div>
                <LogsTable selectedItems={handleSelectedItems} />
                </div>
         </>
    );
}

export default LogsView;