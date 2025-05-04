import L from "leaflet";

interface SetupRoutingOptions {
  map: L.Map;
  userPosition: [number, number];
  routingControlRef: React.MutableRefObject<any>;
  setTravelTime: (value: number) => void;
  setTravelDistance: (value: number) => void;
  setCurrentInstruction: (text: string) => void;
}

export const setupRouting = ({
    map,
    userPosition,
    routingControlRef,
    setTravelTime,
    setTravelDistance,
    setCurrentInstruction,
  }: SetupRoutingOptions) => {
    if (!map || !userPosition || routingControlRef.current) return;
  
    const routingControl = L.Routing.control({
      waypoints: [L.latLng(userPosition[0], userPosition[1])],
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: false,
      show: false,
      createMarker: () => null,
      lineOptions: {
        styles: [{ color: "#2563eb", weight: 4, opacity: 1 }],
      },
      containerClassName: "custom-routing-container",
    })
      .on("routesfound", (e: any) => {
        const summary = e.routes[0].summary;
        const instructions = e.routes[0].instructions || e.routes[0].segments?.flatMap((seg: any) => seg.steps) || [];
  
        setTravelTime(summary.totalTime);
        setTravelDistance(summary.totalDistance);
  
        if (instructions.length > 0) {
          setCurrentInstruction(instructions[0].instruction || instructions[0].text);
        }
      })
      .on("routeselected", (e: any) => {
        const steps = e.route.instructions || e.route.segments?.flatMap((s: any) => s.steps) || [];
        if (steps.length > 0) {
          setCurrentInstruction(steps[0].instruction || steps[0].text);
        }
      })
      .addTo(map);
  
    routingControlRef.current = routingControl;
  
    const container = routingControl.getContainer();
    if (container) container.style.display = "none";  
};
