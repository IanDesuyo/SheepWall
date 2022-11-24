import { useContext, useMemo } from "react";
import { FlowContext } from "./FlowProvider";
import { Box, Text, HStack, Image, Grid } from "@chakra-ui/react";
import { getDomain, commonAppDomains } from "../utils/domain";

export default function DeviceInfo() {
  const { devices, filter } = useContext(FlowContext);

  const device = useMemo(() => {
    console.log("device update");
    if (filter === "") {
      return;
    }

    return devices[filter];
  }, [devices, filter]);

  const apps = useMemo(() => {
    console.log("apps update");
    if (!device?.seenDns) {
      return [];
    }

    const _apps = Object.keys(device.seenDns).reduce((acc, dns) => {
      const domain = getDomain(dns);

      for (const commonDomain in commonAppDomains) {
        if (domain.endsWith(commonDomain)) {
          acc[commonAppDomains[commonDomain]] = true;
          break;
        }
      }

      return acc;
    }, {} as Record<string, boolean>);

    return Object.keys(_apps);
  }, [device?.seenDns]);

  return device ? (
    <Box bg="#1b1b1b" px="4" py={1} h="15%" overflow="scroll">
      <Box>
        <Text fontSize="2xl">關於 {device.ip}</Text>
      </Box>
      <Grid templateColumns="1fr 1fr 1fr">
        <Box>
          <Text>偵測到的裝置:</Text>
          {/* {JSON.stringify(Object.keys(device.useragent))} */}
          {Object.values(device.useragent).map((ua, index) => {
            const result = ua.getResult();

            return (
              <Box key={index}>
                <Text>
                  型號: {result.device.vendor} {result.device.model}
                </Text>
                <Text>
                  瀏覽器: {result.os.name}({result.os.version}) {result.browser.name}(
                  {result.browser.version})
                </Text>
              </Box>
            );
          })}
        </Box>
        <Box>
          <Text>偵測到的常見APP:</Text>
          <HStack gap={2}>
            {apps.map((app, index) => {
              return <Image key={index} src={app} boxSize="32px" />;
            })}
          </HStack>
        </Box>
      </Grid>
    </Box>
  ) : null;
}
