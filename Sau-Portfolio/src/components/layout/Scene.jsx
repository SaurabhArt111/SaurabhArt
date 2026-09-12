
import "./Scene.css";

const styles = {
  "hold": "scene-hold",
  "runway": "scene-runway",
  "keepFrame": "scene-keep-frame",
  "keepRunway": "scene-keep-runway",
};

export default function Scene({
  children,
  runway = 0,
  order,
  id,
  keepOnMobile = false,
}) {
  return (
    <>
      <div
        className={`${styles.hold} ${keepOnMobile ? styles.keepFrame : ""}`}
        data-scene={id ?? String(order)}
        style={{ zIndex: order }}
      >
        {children}
      </div>
      {runway > 0 && (
        <div
          className={`${styles.runway} ${keepOnMobile ? styles.keepRunway : ""}`}
          data-runway={id ?? String(order)}
          style={{ height: `calc(${runway} * 100svh)` }}
          aria-hidden="true"
        />
      )}
    </>
  );
}
