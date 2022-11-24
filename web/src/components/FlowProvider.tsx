import { createContext, useEffect, useState } from "react";
import produce from "immer";
import type { Flow } from "../flow";
import { getDomain } from "../utils/domain";
import UAParser from "ua-parser-js";

type FlowContextType = {
  flows: Flows;
  devices: Devices;
  filter: string;
  setFilter: (filter: string) => void;
};

type Flows = {
  [key: string]: Flow;
};

type Devices = {
  [key: string]: {
    ip: string;
    useragent: {
      [key: string]: UAParser;
    };
    seenDns: {
      [key: string]: boolean;
    };
    updatedAt: Date;
  };
};

export const FlowContext = createContext<FlowContextType>({ flows: {}, devices: {}, filter: "", setFilter: () => {} });

type FlowProviderProps = {
  children: React.ReactNode;
};

export default function FlowProvider({ children }: FlowProviderProps) {
  const [flows, setFlows] = useState<Flows>({});
  const [devices, setDevices] = useState<Devices>({});
  const [filter, setFilter] = useState("");

  const loadFlows = async () => {
    console.log("loadFlows");
    const response = await fetch(`/flows`);
    const data = (await response.json()) as Flow[];
    const newFlows: Flows = {};
    const newDevices: Devices = {};

    for (const flow of data) {
      newFlows[flow.id] = flow;
      const ip = flow.client_conn.peername[0];

      if (!newDevices[ip]) {
        newDevices[ip] = {
          ip: ip,
          useragent: {},
          seenDns: {},
          updatedAt: new Date(),
        };
      }

      if (flow.type === "dns") {
        // only add top and second level domains
        const domains = flow.request.questions.map(value => getDomain(value.name, 3));

        for (const domain of domains) {
          newDevices[ip].seenDns[domain] = true;
        }
      }

      if (flow.type === "http") {
        const useragent = flow.request.headers.find(header => header[0] === "user-agent")?.[1];

        if (useragent) {
          if (!newDevices[ip].useragent[useragent]) {
            newDevices[ip].useragent[useragent] = new UAParser(useragent);
          }
        }
      }
    }

    setFlows(newFlows);
    setDevices(newDevices);
  };

  const handleFlow = (flow: Flow) => {
    setFlows(prev =>
      produce(prev, draft => {
        draft[flow.id] = flow;
      })
    );

    setDevices(prev =>
      produce(prev, draft => {
        const ip = flow.client_conn.peername[0];

        if (!draft[ip]) {
          draft[ip] = {
            ip: ip,
            useragent: {},
            seenDns: {},
            updatedAt: new Date(),
          };
        }

        if (flow.type === "http") {
          const useragent = flow.request.headers.find(header => header[0].toLowerCase() === "user-agent")?.[1];

          if (useragent) {
            if (!draft[ip].useragent[useragent]) {
              draft[ip].useragent[useragent] = new UAParser(useragent);
            }
          }
        }

        if (flow.type === "dns") {
          // only add top and second level domains
          const domains = flow.request.questions.map(value => getDomain(value.name, 3));

          for (const domain of domains) {
            draft[ip].seenDns[domain] = true;
          }
        }
      })
    );
  };

  useEffect(() => {
    loadFlows();

    const ws = new WebSocket(`ws://${window.location.host}/updates`);

    ws.addEventListener("error", event => {
      console.error(event);
    });

    ws.addEventListener("message", event => {
      const eventData = JSON.parse(event.data);

      if (eventData.resource === "flows") {
        handleFlow(eventData.data as Flow);
      } else if (eventData.resource === "reset") {
        loadFlows();
      }
    });

    return () => {
      ws.close();
    };
  }, []);

  return <FlowContext.Provider value={{ flows, devices, filter, setFilter }}>{children}</FlowContext.Provider>;
}
