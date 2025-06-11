import {
  DownOutlined,
  LeftOutlined,
  RightOutlined,
  UpOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  Flex,
  type NotificationArgsProps,
  Row,
  notification,
} from "antd";
import { useEffect, useState } from "react";
import { TokenDetails } from "../TokenDetails";
import { parseStyleDictionaryFromFile } from "../../utils/style-dictionary-parsing/parseStyleDictionary";
import { StyleDictionaryImporter } from "./StyleDictionaryImporter";
import { applyParsedSDToDocument } from "../../utils/style-dictionary-parsing/applyParsedSDToDocument";

export const TokenInspector = ({
  onClose,
  tokenFile,
  hide = false,
}: {
  onClose: () => void;
  tokenFile?: string;
  hide?: boolean;
}) => {
  const [api, contextHolder] = notification.useNotification();
  const [location, setLocation] =
    useState<NotificationArgsProps["placement"]>("bottomRight");

  const openNotification = (location: NotificationArgsProps["placement"]) => {
    api.open({
      message: "",
      description: (
        <Row
          align={
            location === "bottomLeft" || location === "bottomRight"
              ? "bottom"
              : "top"
          }
          style={{
            maxHeight: "80vh",
            overflow: "scroll",
          }}
        >
          <Col span={22}>
            <Flex gap={8} vertical>
              <TokenDetails />
              <StyleDictionaryImporter />
            </Flex>
          </Col>
          <Col span={2} style={{ paddingTop: "2rem" }}>
            <Button
              size="small"
              shape="circle"
              icon={
                location === "topLeft" ? (
                  <RightOutlined />
                ) : location === "topRight" ? (
                  <DownOutlined />
                ) : location === "bottomRight" ? (
                  <LeftOutlined />
                ) : (
                  <UpOutlined />
                )
              }
              onClick={() => handleClick(location)}
            />
          </Col>
        </Row>
      ),
      placement: location,
      key: location,
      duration: 0,
      onClose: onClose,
      className: "tokenInspector",
    });
  };

  const handleClick = (location: NotificationArgsProps["placement"]) => {
    api.destroy(location);
    let newLocation: NotificationArgsProps["placement"];
    switch (location) {
      case "topLeft":
        newLocation = "topRight";
        break;
      case "topRight":
        newLocation = "bottomRight";
        break;
      case "bottomRight":
        newLocation = "bottomLeft";
        break;
      case "bottomLeft":
        newLocation = "topLeft";
        break;
    }
    setLocation(newLocation);
    openNotification(newLocation);
  };

  useEffect(() => {
    if (!hide) {
      openNotification(location);
    }

    if (tokenFile) {
      parseStyleDictionaryFromFile(tokenFile).then((tokens) => {
        console.log("Parsed tokens:", tokens);
        if (tokens) {
          applyParsedSDToDocument(tokens[0].output as string);
        } else {
          console.error("Failed to parse Style Dictionary tokens.");
        }
      });
    }
  }, []);

  return contextHolder;
};
