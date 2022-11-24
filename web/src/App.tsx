import { Flex, Box, Text } from "@chakra-ui/react";
import DeviceFilter from "./components/DeviceFilter";
import FlowTable from "./components/FlowTable";

export default function App() {
  return (
    <Flex w="100vw" h="100vh" bg="#121212">
      <Flex direction="column" w="15%" bg="#242424">
        <Box p={4} textAlign="center">
          <Text fontSize="2xl">HackerSir SheepWall</Text>
        </Box>
        <DeviceFilter />
      </Flex>

      <FlowTable />
    </Flex>
  );
}
