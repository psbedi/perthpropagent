import { useState, useRef } from "react";

const SYSTEM_PROMPT = `You are a Perth, Australia real estate research agent. Your job is to find suitable properties in Perth, WA that meet these criteria:
- 4 bedrooms or more
- 2 bathrooms or more
- 2 car parks or more

Search for properties on realestate.com.au and get additional details like land size, house size, estimated monthly payment, and price range from property.com.au or similar sources.

For each search, use web search to find real listings. Return results as a JSON array with this structure:
[
  {
    "address": "full address",
    "suburb": "suburb name",
    "price": "listed price or price range",
    "bedrooms": number,
    "bathrooms": number,
    "carparks": number,
    "landSize": "land size in sqm or N/A",
    "houseSize": "built-up size in sqm or N/A",
    "estimatedMonthly": "estimated monthly repayment or N/A",
    "priceMin": "minimum price estimate or N/A",
    "priceMax": "maximum price estimate or N/A",
    "propertyType": "house/apartment/etc",
    "url": "listing URL if available",
    "imageUrl": "direct URL to the main property photo from the listing page (must be a real image URL ending in .jpg, .jpeg, .png or similar — look for og:image or the first listing photo src in the page HTML; use null if not found)",
    "source": "realestate.com.au or property.com.au",
    "description": "brief property description"
  }
]

Search realestate.com.au for Perth properties with 4+ bedrooms, 2+ bathrooms, 2+ car spaces. For each listing, try to extract the main property photo URL. Then cross-reference with property.com.au for valuation data.

IMPORTANT: Return ONLY the JSON array, no other text, no markdown code fences. If you cannot find specific details, use "N/A". For imageUrl, use null if not found. Find at least 5-8 properties if possible.`;

const BUDGET_LABELS = {
  any: "Any price",
  500000: "Up to $500k",
  700000: "Up to $700k",
  1000000: "Up to $1M",
  1500000: "Up to $1.5M",
};

const SUBURB_OPTIONS = [
  "Any suburb",
  "Alkimos", "Applecross", "Armadale",
  "Balcatta", "Baldivis", "Balga", "Banksia Grove", "Bassendean", "Bayswater",
  "Beaconsfield", "Beckenham", "Belmont", "Bentley", "Bertram", "Bull Creek",
  "Burns Beach", "Butler", "Byford",
  "Camillo", "Canning Vale", "Cannington", "Carlisle", "Caversham",
  "Claremont", "Clarkson", "Cloverdale", "Cockburn Central", "Como",
  "Cooloongup", "Coolbellup", "Cottesloe",
  "Dalkeith", "Duncraig",
  "East Fremantle", "East Victoria Park", "Edgewater", "Embleton",
  "Floreat", "Forrestdale", "Forrestfield", "Fremantle",
  "Girrawheen", "Glen Forrest", "Glendalough", "Gosnells", "Greenwood",
  "Guildford", "Gwelup",
  "Hamilton Hill", "Harrisdale", "Hazelmere", "Helena Valley", "Highgate",
  "Hillarys", "Huntingdale",
  "Inglewood", "Innaloo",
  "Joondanna", "Joondalup",
  "Kalamunda", "Kardinya", "Karrinyup", "Kelmscott", "Kenwick", "Kinross",
  "Kwinana",
  "Leederville", "Leeming", "Lynwood",
  "Maddington", "Mahogany Creek", "Mandurah", "Manning", "Meadow Springs",
  "Melville", "Merriwa", "Midland", "Mindarie", "Mirrabooka", "Morley",
  "Mosman Park", "Mount Hawthorn", "Mount Lawley", "Mount Pleasant",
  "Mullaloo", "Mundaring", "Murdoch", "Myaree",
  "Nedlands", "Nollamara", "Noranda", "North Fremantle", "North Perth",
  "Ocean Reef", "Osborne Park",
  "Padbury", "Parkwood", "Peppermint Grove", "Perth CBD", "Port Kennedy",
  "Redcliffe", "Riverton", "Rivervale", "Rockingham", "Roleystone",
  "Safety Bay", "Scarborough", "Secret Harbour", "Shelley", "Shenton Park",
  "Singleton", "Sorrento", "South Fremantle", "South Guildford", "South Perth",
  "Southern River", "Stirling", "Subiaco", "Swan View", "Swanbourne",
  "Thornlie", "Trigg", "Tuart Hill",
  "Victoria Park",
  "Waikiki", "Wanneroo", "Warwick", "Wattle Grove", "Wellard", "Wembley",
  "West Perth", "Willetton", "Woodvale",
  "Yokine",
].sort((a, b) => a === "Any suburb" ? -1 : b === "Any suburb" ? 1 : a.localeCompare(b));

// ─── Property Card ───────────────────────────────────────────────────────────

function PropertyCard({ prop, index }) {
  const [imgError, setImgError] = useState(false);

  const fmt = (p) => (!p || p === "N/A" ? "Contact agent" : p);
  const hasImage = prop.imageUrl && prop.imageUrl !== "N/A" && !imgError;

  const cardStyle = {
    background: "var(--bg-primary)",
    border: "1px solid var(--border-light)",
    borderRadius: "var(--radius-lg)",
    marginBottom: "0.75rem",
    overflow: "hidden",
    animation: `fadeIn 0.3s ease ${index * 0.08}s both`,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  };

  return (
    <div style={cardStyle}>
      {/* ── Photo ── */}
      {hasImage ? (
        <div style={{ position: "relative", height: 200, background: "var(--bg-secondary)" }}>
          <img
            src={prop.imageUrl}
            alt={`Property at ${prop.address}`}
            onError={() => setImgError(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.65))",
          }} />
          <div style={{ position: "absolute", bottom: 10, left: 14, right: 80 }}>
            <p style={{ fontWeight: 600, fontSize: 15, margin: "0 0 2px", color: "#fff" }}>{prop.address}</p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", margin: 0 }}>{prop.suburb} · {prop.propertyType}</p>
          </div>
          <div style={{ position: "absolute", top: 10, right: 10, textAlign: "right" }}>
            <span style={{
              display: "block", background: "rgba(0,0,0,0.65)", color: "#fff",
              fontWeight: 600, fontSize: 14, padding: "3px 10px",
              borderRadius: "var(--radius-md)", marginBottom: 4,
            }}>{fmt(prop.price)}</span>
            {prop.source && (
              <span style={{
                fontSize: 11, background: "var(--bg-info)", color: "var(--text-info)",
                padding: "2px 8px", borderRadius: "var(--radius-sm)",
              }}>{prop.source}</span>
            )}
          </div>
        </div>
      ) : (
        <div style={{
          height: 90, background: "var(--bg-secondary)", display: "flex",
          alignItems: "center", justifyContent: "center",
          borderBottom: "1px solid var(--border-light)",
        }}>
          <i className="ti ti-home" style={{ fontSize: 32, color: "var(--border-mid)" }} />
        </div>
      )}

      {/* ── Details ── */}
      <div style={{ padding: "1rem 1.25rem" }}>
        {!hasImage && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: 15, margin: "0 0 2px", color: "var(--text-primary)" }}>{prop.address}</p>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>{prop.suburb} · {prop.propertyType}</p>
            </div>
            <div style={{ textAlign: "right", marginLeft: 12 }}>
              <p style={{ fontWeight: 600, fontSize: 15, margin: "0 0 4px", color: "var(--text-primary)" }}>{fmt(prop.price)}</p>
              {prop.source && (
                <span style={{
                  fontSize: 11, background: "var(--bg-info)", color: "var(--text-info)",
                  padding: "2px 8px", borderRadius: "var(--radius-sm)",
                }}>{prop.source}</span>
              )}
            </div>
          </div>
        )}

        {/* Stats pills */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, margin: "12px 0" }}>
          {[
            { icon: "ti-bed", label: "Bedrooms", value: prop.bedrooms },
            { icon: "ti-bath", label: "Bathrooms", value: prop.bathrooms },
            { icon: "ti-car", label: "Car parks", value: prop.carparks },
          ].map(s => (
            <div key={s.label} style={{
              background: "var(--bg-secondary)", borderRadius: "var(--radius-md)",
              padding: "8px 10px", textAlign: "center",
            }}>
              <i className={`ti ${s.icon}`} style={{ fontSize: 15, color: "var(--text-secondary)" }} />
              <p style={{ fontSize: 18, fontWeight: 600, margin: "2px 0 0", color: "var(--text-primary)" }}>{s.value}</p>
              <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Property details grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "6px 16px", marginBottom: 10 }}>
          {[
            { label: "Land size", value: prop.landSize },
            { label: "Built-up", value: prop.houseSize },
            { label: "Est. monthly", value: prop.estimatedMonthly },
            {
              label: "Price range",
              value: prop.priceMin && prop.priceMax && prop.priceMin !== "N/A"
                ? `${prop.priceMin} – ${prop.priceMax}` : "N/A"
            },
          ].map(d => (
            <div key={d.label} style={{ fontSize: 13 }}>
              <span style={{ color: "var(--text-secondary)" }}>{d.label}: </span>
              <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{d.value || "N/A"}</span>
            </div>
          ))}
        </div>

        {prop.description && (
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "8px 0 10px", lineHeight: 1.5 }}>
            {prop.description}
          </p>
        )}

        {prop.url && prop.url !== "N/A" && (
          <a href={prop.url} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 13, display: "inline-flex", alignItems: "center", gap: 4 }}>
            View listing <i className="ti ti-external-link" style={{ fontSize: 13 }} />
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Spinner line ────────────────────────────────────────────────────────────

function StatusLine({ text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 0", color: "var(--text-secondary)", fontSize: 14 }}>
      <div style={{
        width: 14, height: 14, borderRadius: "50%",
        border: "2px solid var(--border-mid)",
        borderTopColor: "var(--text-secondary)",
        animation: "spin 0.8s linear infinite", flexShrink: 0,
      }} />
      {text}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function PerthPropertyAgent() {
  const [suburb, setSuburb] = useState("Any suburb");
  const [budget, setBudget] = useState("any");
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const buildPrompt = () => {
    const suburbPart = suburb !== "Any suburb" ? ` in ${suburb}` : " across Perth";
    const budgetPart = budget !== "any" ? ` with a maximum price of $${Number(budget).toLocaleString()}` : "";
    return `Search realestate.com.au for properties${suburbPart} in Perth, WA${budgetPart} that have 4 or more bedrooms, 2 or more bathrooms, and 2 or more car parks. Then look up property.com.au for land size, built-up area, estimated monthly repayments, and price range estimates for those properties. Return the results as a JSON array only.`;
  };

  const search = async () => {
    setLoading(true);
    setError("");
    setProperties([]);
    setSearched(true);
    setStatusMsg("Searching realestate.com.au for Perth properties…");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          system: SYSTEM_PROMPT,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{ role: "user", content: buildPrompt() }],
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `API error: ${response.status}`);
      }

      const data = await response.json();
      setStatusMsg("Processing property details…");

      const textBlocks = (data.content || [])
        .filter(b => b.type === "text")
        .map(b => b.text)
        .join("");

      const cleaned = textBlocks.replace(/```json|```/g, "").trim();
      const start = cleaned.indexOf("[");
      const end = cleaned.lastIndexOf("]");

      if (start === -1 || end === -1)
        throw new Error("No property data returned. Try a different suburb or price range.");

      setProperties(JSON.parse(cleaned.slice(start, end + 1)));
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setStatusMsg("");
    }
  };

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <i className="ti ti-building-skyscraper" style={{ fontSize: 22, color: "var(--text-secondary)" }} />
          <h1 style={{ fontWeight: 600, fontSize: 20, margin: 0, color: "var(--text-primary)" }}>
            Perth Property Search
          </h1>
        </div>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: "0 0 0 32px" }}>
          4+ beds · 2+ baths · 2+ car parks — sourced from realestate.com.au &amp; property.com.au
        </p>
      </div>

      {/* ── Search controls ── */}
      <div style={{
        background: "var(--bg-primary)", border: "1px solid var(--border-light)",
        borderRadius: "var(--radius-lg)", padding: "1rem 1.25rem", marginBottom: "1.25rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, alignItems: "end" }}>
          <div>
            <label>Suburb</label>
            <select value={suburb} onChange={e => setSuburb(e.target.value)}>
              {SUBURB_OPTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label>Max budget</label>
            <select value={budget} onChange={e => setBudget(e.target.value)}>
              {Object.entries(BUDGET_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <button onClick={search} disabled={loading}>
            {loading ? "Searching…" : "Search ↗"}
          </button>
        </div>

        {loading && <StatusLine text={statusMsg} />}
        {error && (
          <div style={{
            marginTop: 12, padding: "10px 14px", background: "var(--bg-danger)",
            borderRadius: "var(--radius-md)", fontSize: 14, color: "var(--text-danger)",
          }}>
            <i className="ti ti-alert-circle" style={{ fontSize: 15, marginRight: 6, verticalAlign: "-2px" }} />
            {error}
          </div>
        )}
      </div>

      {/* ── Results ── */}
      {properties.length > 0 && (
        <div>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: "0.75rem",
          }}>
            <p style={{ fontWeight: 600, fontSize: 15, margin: 0, color: "var(--text-primary)" }}>
              {properties.length} {properties.length === 1 ? "property" : "properties"} found
            </p>
            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
              {suburb !== "Any suburb" ? suburb : "Perth"}
              {budget !== "any" ? ` · max $${Number(budget).toLocaleString()}` : ""}
            </span>
          </div>
          {properties.map((prop, i) => <PropertyCard key={i} prop={prop} index={i} />)}
        </div>
      )}

      {searched && !loading && properties.length === 0 && !error && (
        <div style={{ textAlign: "center", padding: "2rem 0", color: "var(--text-secondary)", fontSize: 14 }}>
          <i className="ti ti-home-off" style={{ fontSize: 28, display: "block", marginBottom: 8 }} />
          No properties found. Try a different suburb or budget.
        </div>
      )}
    </div>
  );
}
