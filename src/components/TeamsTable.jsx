import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Search } from "lucide-react";
import { getData } from "@/api/apiService";

export default function TeamsTable() {
  const [teams, setTeams] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setIsLoading(true);
        const response = await getData("/group-names");
        setTeams(response || []);
        setIsLoading(false);
      } catch (error) {
        setError("Error fetching team names");
        setIsLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const filteredTeams = teams.filter(
    (team) =>
      team.short_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (team.long_name &&
        team.long_name.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-purple-600 to-purple-800">
        <h3 className="text-2xl font-bold text-white mb-4">
          Grupo empresas registrados
        </h3>
      </div>
      <div className="p-4 border-b border-purple-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" />
          <Input
            type="search"
            placeholder="Buscar equipos..."
            className="w-full pl-10 pr-4 py-2 border-2 border-purple-200 rounded-md focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="h-[400px] sm:h-[500px] lg:h-[600px]">
        <div className="min-w-full inline-block align-middle">
          <div className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-purple-100">
                  <TableHead className="w-1/3 sm:w-1/2 font-bold text-purple-800 px-4 py-3">
                    Nombre corto
                  </TableHead>
                  <TableHead className="w-2/3 sm:w-1/2 font-bold text-purple-800 px-4 py-3">
                    Nombre largo
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={2} className="h-64">
                      <div className="flex justify-center items-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                        <span className="ml-2 text-lg font-medium text-purple-600">
                          Cargando...
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredTeams.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="text-center text-purple-600 py-4"
                    >
                      No se encontraron equipos.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTeams.map((team, index) => (
                    <TableRow
                      key={index}
                      className="hover:bg-purple-50 transition-colors duration-200"
                    >
                      <TableCell className="font-medium text-purple-700 px-4 py-3 break-words">
                        {team.short_name}
                      </TableCell>
                      <TableCell className="text-purple-600 px-4 py-3 break-words">
                        {team.long_name || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
