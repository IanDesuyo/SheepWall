import { useContext } from "react";
import { FlowContext } from "./FlowProvider";
import { Flex, Box, Input } from "@chakra-ui/react";

export default function DeviceFilter() {
  const { devices, filter, setFilter } = useContext(FlowContext);

  const handleInputEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setFilter(e.currentTarget.value);
    }
  };

  return (
    <Flex direction="column" m={2} gap={6}>
      <Input placeholder={filter.length > 0 ? filter : "Search IP"} onKeyPress={handleInputEnter} />

      <Flex direction="column" gap={2}>
        {filter && (
          <Box onClick={() => setFilter("")} p={1} _hover={{ bg: "#363636" }}>
            Clear Filter
          </Box>
        )}

        {Object.keys(devices)
          .filter(ip => ip.includes(filter))
          .map(ip => (
            <DeviceItem key={ip} ip={ip} onClick={setFilter} />
          ))}
      </Flex>
    </Flex>
  );
}

type DeviceItemProps = {
  ip: string;
  onClick: (ip: string) => void;
};

const DeviceItem = ({ ip, onClick }: DeviceItemProps) => {
  return (
    <Box key={ip} onClick={() => onClick(ip)} p={1} _hover={{ bg: "#363636" }}>
      {ip}
    </Box>
  );
};
