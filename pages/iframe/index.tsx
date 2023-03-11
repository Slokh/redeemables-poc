import { Button } from "@chakra-ui/button";
import { Image } from "@chakra-ui/image";
import { Flex, Stack, Text } from "@chakra-ui/layout";
import { verifyMessage } from "@ethersproject/wallet";
import { BigNumber } from "ethers";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { erc721ABI, useContractRead } from "wagmi";

const requirements = [
  {
    name: "Creature #6625",
    token: "0xc92ceddfb8dd984a89fb494c376f9a48b999aafc",
    identifier: 6625,
  },
];

const message = "Sign this message";

const Home: NextPage = () => {
  const [isLocked, setLocked] = useState(true);
  const { data, isError, isLoading } = useContractRead({
    address: requirements[0].token as `0x${string}`,
    abi: erc721ABI,
    functionName: "ownerOf",
    args: [BigNumber.from(requirements[0].identifier)],
  });

  const handleMessage = (event: MessageEvent) => {
    if (event.data?.type !== "web3-auth-response") {
      return;
    }

    const address = verifyMessage(message, event.data.data.signature);

    if (address === data) {
      setLocked(false);
      window.parent.postMessage(
        {
          type: "web3-auth-request",
          data: { auth: { requirements, message, connected: true } },
        },
        "*"
      );
    } else {
      window.parent.postMessage(
        {
          type: "web3-auth-request",
          data: {
            auth: { requirements, message, connected: false, error: true },
          },
        },
        "*"
      );
    }
  };

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    window.parent.postMessage(
      {
        type: "web3-auth-request",
        data: { auth: { requirements, message, connected: false } },
      },
      "*"
    );
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <Stack justify="center" align="center" w="full" h="full" spacing={8}>
      <Flex
        w="full"
        bgColor="red.200"
        fontWeight="bold"
        align="center"
        justify="center"
      >
        This is inside an iframe
      </Flex>
      {isLocked ? (
        <Text>This content is unavailable to you.</Text>
      ) : (
        <Text>Welcome collector!</Text>
      )}
    </Stack>
  );
};

export default Home;
