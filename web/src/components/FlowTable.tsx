import { useContext, useMemo } from "react";
import { FlowContext } from "./FlowProvider";
import { Flex, Box } from "@chakra-ui/react";
import type { Flow } from "../flow";
import DataGrid, { Column } from "react-data-grid";
import { getDomain } from "../utils/domain";
import "react-data-grid/lib/styles.css";
import DeviceInfo from "./DeviceInfo";

export default function FlowTable() {
  const { flows, filter, setFilter } = useContext(FlowContext);

  const flatFlows = Object.values(flows).flat().reverse();

  const filteredFlows = useMemo(() => {
    if (filter === "") {
      return flatFlows;
    }

    return flatFlows.filter(flow => {
      return flow.client_conn?.peername?.includes(filter) || flow.server_conn?.peername?.includes(filter);
    });
  }, [flatFlows, filter]);

  const columns = useMemo<Column<Flow>[]>(() => {
    return [
      {
        key: "timestamp_created",
        name: "Time",
        width: "10%",
        formatter: ({ row }) => {
          return new Date(row.timestamp_created * 1000).toLocaleString();
        },
      },
      {
        key: "type",
        name: "Type",
        width: "5%",
        formatter: ({ row }) => {
          if (row.type === "dns") {
            return <span style={{ color: "#f7b500" }}>DNS</span>;
          }
          if (row.type === "http") {
            if (row.request.scheme === "https") {
              return <span style={{ color: "#00b300" }}>HTTPS</span>;
            }
            return <span style={{ color: "#3794ef" }}>HTTP</span>;
          }

          return row.type;
        },
      },
      {
        key: "client_conn",
        name: "Source",
        width: "10%",
        formatter: ({ row }) => {
          return (
            <span onDoubleClick={() => setFilter(row.client_conn.peername[0])}>{row.client_conn.peername[0]}</span>
          );
        },
      },
      {
        key: "server_conn",
        name: "Destination",
        width: "75%",
        formatter: ({ row }) => {
          if (row.type === "http") {
            return row.request.pretty_host;
          }
          if (row.type === "dns") {
            return row.request.questions.map(q => getDomain(q.name, 3)).join(", ");
          }

          return row.server_conn?.peername?.[0] || "Unknown";
        },
      },
    ];
  }, [setFilter]);

  return (
    <Flex direction="column" w="100%" h="100%">
      <DeviceInfo />
      <DataGrid columns={columns} rows={filteredFlows} rowKeyGetter={row => row.id} style={{ height: "100%" }} />
      <Box>
        Total: {filter.length > 0 && `${filteredFlows.length} of `}
        {flatFlows.length}
      </Box>
    </Flex>
  );
}
