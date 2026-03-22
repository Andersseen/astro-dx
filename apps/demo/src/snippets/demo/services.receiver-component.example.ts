import { inject } from "@astro-dx/core";
import { getElement } from "@astro-dx/dom";
import { CounterServiceClass } from "../../services/counter.service";

const counter = inject(CounterServiceClass);

getElement("#double-value").text(counter.double);
