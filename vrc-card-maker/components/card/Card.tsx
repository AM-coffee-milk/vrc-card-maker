"use client";

import { forwardRef } from "react";
import { CARD_SIZE, type CardData, type PhotoFrame } from "@/lib/card";
import { CardContext } from "./parts";
import IdCard from "./IdCard";
import PopCard from "./PopCard";
import StreetCard from "./StreetCard";

const TEMPLATE_COMPONENTS = { street: StreetCard, pop: PopCard, idcard: IdCard };

interface Props {
  data: CardData;
  onPhotoChange?: (photo: PhotoFrame) => void;
}

/** 書き出し対象のカード本体。常に原寸 (CARD_SIZE) で描画し、縮小は親側で行う */
const Card = forwardRef<HTMLDivElement, Props>(function Card({ data, onPhotoChange }, ref) {
  const { w, h } = CARD_SIZE[data.orientation];
  const Template = TEMPLATE_COMPONENTS[data.template] ?? StreetCard;
  return (
    <CardContext.Provider value={{ data, onPhotoChange }}>
      <div ref={ref} className="relative font-sans" style={{ width: w, height: h }}>
        <Template />
      </div>
    </CardContext.Provider>
  );
});

export default Card;
