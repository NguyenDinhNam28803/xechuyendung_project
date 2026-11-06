"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Article } from "../data/articles";
import type { Vehicle } from "../data/vehicles";
import type {
  ActivityEntry,
  ContactSubmission,
  LegalResource,
  LegalResourceType,
} from "../data/legal-resources";

type AdminVehicle = Vehicle & { id: string; isPublished: boolean };
type AdminArticle = Article & { id: string; isPublished: boolean };
type AdminLegalResource = LegalResource & { id: string };
type AdminContentItem = AdminVehicle | AdminArticle | AdminLegalResource;
type EditorMode = "closed" | "create" | "edit";
type ContentTab =
  | "vehicles"
  | "articles"
  | "policies"
  | "regulations"
  | "legal_guides"
  | "contact_submissions"
  | "activity";

type VehicleForm = {
  slug: string;
  name: string;
  make: string;
  category: string;
  description: string;
  artwork: string;
  images: string;
  badge: string;
  useCase: string;
  highlights: string;
  knownDetails: string;
  sourceUrl: string;
  isPublished: boolean;
};

type ArticleForm = {
  slug: string;
  category: string;
  title: string;
  summary: string;
  sections: string;
  isPublished: boolean;
};

type LegalResourceForm = {
  slug: string;
  title: string;
  summary: string;
  content: string;
  sourceUrl: string;
  isPublished: boolean;
};
type LegalResourceTab = "policies" | "regulations" | "legal_guides";
type PageResponse<T> = {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
type PageInfo = PageResponse<unknown>["pagination"];

const emptyPageInfo: PageInfo = {
  page: 1,
  limit: 25,
  total: 0,
  totalPages: 0,
};

const emptyVehicle: VehicleForm = {
  slug: "",
  name: "",
  make: "",
  category: "Xe tải",
  description: "",
  artwork: "cargo",
  images: "",
  badge: "Dữ liệu mẫu",
  useCase: "",
  highlights: "",
  knownDetails: "[]",
  sourceUrl: "",
  isPublished: false,
};

const emptyArticle: ArticleForm = {
  slug: "",
  category: "",
  title: "",
  summary: "",
  sections: '[\n  {\n    "heading": "",\n    "paragraphs": [""]\n  }\n]',
  isPublished: false,
};

const emptyLegalResource: LegalResourceForm = {
  slug: "",
  title: "",
  summary: "",
  content: "",
  sourceUrl: "",
  isPublished: false,
};

const tabLabels: Record<ContentTab, string> = {
  vehicles: "Xe",
  articles: "Bài viết",
  policies: "Chính sách",
  regulations: "Quy định",
  legal_guides: "Tìm hiểu pháp lý",
  contact_submissions: "Yêu cầu liên hệ",
  activity: "Lịch sử hoạt động",
};

const pathByTab: Record<ContentTab, string> = {
  vehicles: "/admin/vehicles",
  articles: "/admin/articles",
  policies: "/admin/policies",
  regulations: "/admin/regulations",
  legal_guides: "/admin/legal-guides",
  contact_submissions: "/admin/contact-submissions",
  activity: "/admin/activity",
};

const tabByPath = Object.fromEntries(
  Object.entries(pathByTab).map(([tab, path]) => [path, tab]),
) as Record<string, ContentTab>;

const pageDescriptions: Record<ContentTab, string> = {
  vehicles: "Quản lý danh mục xe và thông tin hiển thị trên website.",
  articles: "Biên tập bài viết, chuyên mục và trạng thái xuất bản.",
  policies: "Quản lý chính sách áp dụng cho hoạt động vận tải.",
  regulations: "Cập nhật quy định và văn bản pháp luật liên quan.",
  legal_guides: "Tổ chức nội dung hướng dẫn tìm hiểu pháp lý.",
  contact_submissions: "Tiếp nhận và theo dõi yêu cầu tư vấn từ khách hàng.",
  activity: "Theo dõi các thao tác quản trị và thay đổi dữ liệu.",
};

const resourceTypeByTab: Record<LegalResourceTab, LegalResourceType> = {
  policies: "policy",
  regulations: "regulation",
  legal_guides: "legal_guide",
};

export default function AdminDashboard() {
  const pathname = usePathname();
  const router = useRouter();
  const tab = tabByPath[pathname] ?? "vehicles";
  const isOverview = pathname === "/admin";
  const [vehicles, setVehicles] = useState<AdminVehicle[]>([]);
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [legalResources, setLegalResources] = useState<AdminLegalResource[]>(
    [],
  );
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<
    ContactSubmission[]
  >([]);
  const [pageInfo, setPageInfo] = useState<Record<ContentTab, PageInfo>>({
    vehicles: emptyPageInfo,
    articles: emptyPageInfo,
    policies: emptyPageInfo,
    regulations: emptyPageInfo,
    legal_guides: emptyPageInfo,
    contact_submissions: emptyPageInfo,
    activity: emptyPageInfo,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [vehicleForm, setVehicleForm] = useState(emptyVehicle);
  const [articleForm, setArticleForm] = useState(emptyArticle);
  const [legalResourceForm, setLegalResourceForm] =
    useState(emptyLegalResource);
  const [selectedId, setSelectedId] = useState("");
  const [editorMode, setEditorMode] = useState<EditorMode>("closed");
  const [detailItem, setDetailItem] = useState<AdminContentItem | null>(null);
  const [search, setSearch] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const loadContentRef = useRef<
    (page?: number, searchTerm?: string) => Promise<void>
  >(async () => undefined);
  const previousSearch = useRef(search);

  useEffect(() => {
    void apiRequest<PageResponse<AdminVehicle>>("/vehicles?page=1&limit=1")
      .then(() => setAuthenticated(true))
      .catch((error: unknown) => {
        if (!(error instanceof AdminApiError) || error.status !== 401) {
          showMessage(errorMessage(error), true);
        }
      })
      .finally(() => setCheckingSession(false));
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    previousSearch.current = "";
    setSearch("");
    setCurrentPage(1);
    setSelectedId("");
    setEditorMode("closed");
    setDetailItem(null);
    setVehicleForm({ ...emptyVehicle });
    setArticleForm({ ...emptyArticle });
    setLegalResourceForm({ ...emptyLegalResource });
    void loadContentRef
      .current(1, "")
      .catch((error: unknown) => showMessage(errorMessage(error), true));
  }, [pathname, authenticated]);

  useEffect(() => {
    if (!authenticated || previousSearch.current === search) return;
    previousSearch.current = search;
    const timer = setTimeout(() => {
      void loadContentRef
        .current(1, search)
        .catch((error: unknown) => showMessage(errorMessage(error), true));
    }, 250);
    return () => clearTimeout(timer);
  }, [search, authenticated]);

  useEffect(() => {
    if (!detailItem) return;
    function dismissOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setDetailItem(null);
    }
    document.addEventListener("keydown", dismissOnEscape);
    return () => document.removeEventListener("keydown", dismissOnEscape);
  }, [detailItem]);

  function showMessage(nextMessage: string, error = false) {
    setMessage(nextMessage);
    setIsError(error);
  }

  async function loadContent(page = currentPage, searchTerm = search) {
    const query = new URLSearchParams({
      page: String(page),
      limit: "25",
      q: searchTerm,
    });
    function resourceQuery(resourceTab: LegalResourceTab) {
      const resourceQuery = new URLSearchParams(query);
      resourceQuery.set("type", resourceTypeByTab[resourceTab]);
      return resourceQuery;
    }
    const [
      nextVehicles,
      nextArticles,
      policyResources,
      regulationResources,
      legalGuideResources,
      nextActivity,
      nextContactSubmissions,
    ] = await Promise.all([
      apiRequest<PageResponse<AdminVehicle>>(`/vehicles?${query}`),
      apiRequest<PageResponse<AdminArticle>>(`/articles?${query}`),
      apiRequest<PageResponse<AdminLegalResource>>(
        `/legal-resources?${resourceQuery("policies")}`,
      ),
      apiRequest<PageResponse<AdminLegalResource>>(
        `/legal-resources?${resourceQuery("regulations")}`,
      ),
      apiRequest<PageResponse<AdminLegalResource>>(
        `/legal-resources?${resourceQuery("legal_guides")}`,
      ),
      apiRequest<PageResponse<ActivityEntry>>(`/activity?${query}`),
      apiRequest<PageResponse<ContactSubmission>>(
        "/contact-submissions/search",
        {
          method: "POST",
          body: JSON.stringify({ page, limit: 25, search: searchTerm }),
        },
      ),
    ]);
    const nextLegalResources = [
      ...policyResources.items,
      ...regulationResources.items,
      ...legalGuideResources.items,
    ];
    const nextPageInfo: Record<ContentTab, PageInfo> = {
      vehicles: nextVehicles.pagination,
      articles: nextArticles.pagination,
      policies: policyResources.pagination,
      regulations: regulationResources.pagination,
      legal_guides: legalGuideResources.pagination,
      activity: nextActivity.pagination,
      contact_submissions: nextContactSubmissions.pagination,
    };
    const activeTotalPages = nextPageInfo[tab].totalPages;
    const effectivePage = Math.min(page, Math.max(activeTotalPages, 1));
    if (effectivePage !== page) {
      await loadContent(effectivePage, searchTerm);
      return;
    }
    setVehicles(nextVehicles.items);
    setArticles(nextArticles.items);
    setLegalResources(nextLegalResources);
    setActivity(nextActivity.items);
    setContactSubmissions(nextContactSubmissions.items);
    setPageInfo((current) => ({ ...current, ...nextPageInfo }));
    setCurrentPage(effectivePage);
  }
  loadContentRef.current = loadContent;

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    showMessage("");
    try {
      await apiRequest<{ ok: boolean }>("/session/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      setAuthenticated(true);
      setPassword("");
      showMessage("Đăng nhập thành công.");
    } catch (error) {
      showMessage(errorMessage(error), true);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLogout() {
    await apiRequest("/session/logout", { method: "POST" });
    setAuthenticated(false);
    setSelectedId("");
    setPassword("");
    showMessage("Đã đăng xuất.");
  }

  async function handleImportDefaults() {
    if (!window.confirm("Chỉ thêm các xe và bài viết mẫu chưa có. Tiếp tục?"))
      return;
    setIsSaving(true);
    try {
      const result = await apiRequest<{
        vehiclesImported: number;
        articlesImported: number;
      }>("/import-defaults", { method: "POST" });
      await loadContent();
      showMessage(
        `Đã nhập ${result.vehiclesImported} xe và ${result.articlesImported} bài viết mới. Nội dung trùng slug được giữ nguyên.`,
      );
    } catch (error) {
      showMessage(errorMessage(error), true);
    } finally {
      setIsSaving(false);
    }
  }

  function startNew() {
    setSelectedId("");
    setEditorMode("create");
    setDetailItem(null);
    setVehicleForm({ ...emptyVehicle });
    setArticleForm({ ...emptyArticle });
    setLegalResourceForm({ ...emptyLegalResource });
    showMessage("");
  }

  function closeEditor() {
    setSelectedId("");
    setEditorMode("closed");
    setVehicleForm({ ...emptyVehicle });
    setArticleForm({ ...emptyArticle });
    setLegalResourceForm({ ...emptyLegalResource });
  }

  function editVehicle(vehicle: AdminVehicle) {
    setSelectedId(vehicle.id);
    setEditorMode("edit");
    setDetailItem(null);
    setVehicleForm({
      slug: vehicle.slug,
      name: vehicle.name,
      make: vehicle.make,
      category: vehicle.category,
      description: vehicle.description,
      artwork: vehicle.artwork,
      images: vehicle.images.join("\n"),
      badge: vehicle.badge,
      useCase: vehicle.useCase,
      highlights: vehicle.highlights.join("\n"),
      knownDetails: JSON.stringify(vehicle.knownDetails, null, 2),
      sourceUrl: vehicle.sourceUrl ?? "",
      isPublished: vehicle.isPublished,
    });
    showMessage("");
  }

  function editArticle(article: AdminArticle) {
    setSelectedId(article.id);
    setEditorMode("edit");
    setDetailItem(null);
    setArticleForm({
      slug: article.slug,
      category: article.category,
      title: article.title,
      summary: article.summary,
      sections: JSON.stringify(article.sections, null, 2),
      isPublished: article.isPublished,
    });
    showMessage("");
  }

  function editLegalResource(resource: AdminLegalResource) {
    const nextTab =
      resource.resourceType === "policy"
        ? "policies"
        : resource.resourceType === "regulation"
          ? "regulations"
          : "legal_guides";
    if (tab !== nextTab) router.push(pathByTab[nextTab]);
    setSelectedId(resource.id);
    setEditorMode("edit");
    setDetailItem(null);
    setLegalResourceForm({
      slug: resource.slug,
      title: resource.title,
      summary: resource.summary,
      content: resource.content,
      sourceUrl: resource.sourceUrl ?? "",
      isPublished: resource.isPublished,
    });
    showMessage("");
  }

  async function saveVehicle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        slug: vehicleForm.slug,
        name: vehicleForm.name,
        make: vehicleForm.make,
        category: vehicleForm.category,
        description: vehicleForm.description,
        artwork: vehicleForm.artwork,
        images: lines(vehicleForm.images),
        badge: vehicleForm.badge,
        useCase: vehicleForm.useCase,
        highlights: lines(vehicleForm.highlights),
        knownDetails: JSON.parse(vehicleForm.knownDetails) as {
          label: string;
          value: string;
        }[],
        sourceUrl: vehicleForm.sourceUrl || null,
        isPublished: vehicleForm.isPublished,
      };
      await apiRequest(selectedId ? `/vehicles/${selectedId}` : "/vehicles", {
        method: selectedId ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });
      await loadContent();
      closeEditor();
      showMessage("Đã lưu thông tin xe.");
    } catch (error) {
      showMessage(errorMessage(error), true);
    } finally {
      setIsSaving(false);
    }
  }

  async function saveArticle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        ...articleForm,
        sections: JSON.parse(articleForm.sections) as Article["sections"],
      };
      await apiRequest(selectedId ? `/articles/${selectedId}` : "/articles", {
        method: selectedId ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });
      await loadContent();
      closeEditor();
      showMessage("Đã lưu bài viết.");
    } catch (error) {
      showMessage(errorMessage(error), true);
    } finally {
      setIsSaving(false);
    }
  }

  async function saveLegalResource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (tab !== "policies" && tab !== "regulations" && tab !== "legal_guides") {
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        ...legalResourceForm,
        resourceType: resourceTypeByTab[tab],
        sourceUrl: legalResourceForm.sourceUrl || null,
      };
      await apiRequest(
        selectedId ? `/legal-resources/${selectedId}` : "/legal-resources",
        {
          method: selectedId ? "PATCH" : "POST",
          body: JSON.stringify(payload),
        },
      );
      await loadContent();
      closeEditor();
      showMessage("Đã lưu tài liệu.");
    } catch (error) {
      showMessage(errorMessage(error), true);
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteItem(
    kind: "vehicles" | "articles" | "legal-resources",
    id: string,
    name: string,
  ) {
    if (!window.confirm(`Xóa "${name}"? Thao tác này không thể hoàn tác.`))
      return;
    try {
      await apiRequest(`/${kind}/${id}`, { method: "DELETE" });
      if (selectedId === id) closeEditor();
      if (detailItem?.id === id) setDetailItem(null);
      await loadContent();
      showMessage("Đã xóa nội dung.");
    } catch (error) {
      showMessage(errorMessage(error), true);
    }
  }

  async function updateContactStatus(
    submission: ContactSubmission,
    status: ContactSubmission["status"],
  ) {
    try {
      await apiRequest(`/contact-submissions/${submission.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await loadContent();
      showMessage("Đã cập nhật trạng thái yêu cầu liên hệ.");
    } catch (error) {
      showMessage(errorMessage(error), true);
    }
  }

  async function deleteContactSubmission(submission: ContactSubmission) {
    if (
      !window.confirm(
        `Xóa yêu cầu liên hệ của ${submission.name}? Thông tin liên hệ sẽ bị xóa khỏi hệ thống.`,
      )
    ) {
      return;
    }
    try {
      await apiRequest(`/contact-submissions/${submission.id}`, {
        method: "DELETE",
      });
      await loadContent();
      showMessage("Đã xóa yêu cầu liên hệ.");
    } catch (error) {
      showMessage(errorMessage(error), true);
    }
  }

  if (checkingSession) {
    return (
      <main className="admin-shell">
        <p>Đang kiểm tra phiên quản trị...</p>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="admin-shell admin-login-shell">
        <form className="admin-card admin-login" onSubmit={handleLogin}>
          <span className="admin-eyebrow">XE CHUYÊN DỤNG</span>
          <h1>Đăng nhập quản trị</h1>
          <p>Đăng nhập để quản lý danh mục xe và bài viết.</p>
          <label>
            Tên đăng nhập
            <input
              autoComplete="username"
              onChange={(event) => setUsername(event.target.value)}
              required
              value={username}
            />
          </label>
          <label>
            Mật khẩu
            <input
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>
          <button
            className="admin-primary-button"
            disabled={isSaving}
            type="submit"
          >
            {isSaving ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
          {message && (
            <p className="admin-feedback admin-feedback-error" role="status">
              {message}
            </p>
          )}
        </form>
      </main>
    );
  }

  const visibleResources =
    tab === "policies" || tab === "regulations" || tab === "legal_guides"
      ? legalResources.filter(
          (resource) => resource.resourceType === resourceTypeByTab[tab],
        )
      : [];
  const visibleCount = pageInfo[tab].total;
  const filteredVehicles = vehicles.filter((vehicle) =>
    `${vehicle.name} ${vehicle.make} ${vehicle.category}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const filteredArticles = articles.filter((article) =>
    `${article.title} ${article.category}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const filteredResources = visibleResources.filter((resource) =>
    `${resource.title} ${resource.slug} ${resource.summary}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const filteredContactSubmissions = contactSubmissions.filter((submission) =>
    `${submission.name} ${submission.phone} ${submission.category} ${submission.location} ${submission.message}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/admin">
          <span className="admin-brand-mark">XD</span>
          <span>
            <strong>XE CHUYÊN DỤNG</strong>
            <small>KHÔNG GIAN QUẢN TRỊ</small>
          </span>
        </Link>
        <nav className="admin-navigation" aria-label="Điều hướng quản trị">
          <span className="admin-navigation-label">TỔNG QUAN</span>
          <Link
            aria-current={isOverview ? "page" : undefined}
            className={isOverview ? "active" : ""}
            href="/admin"
          >
            <span className="admin-nav-icon">◫</span>
            Tổng quan
          </Link>
          <span className="admin-navigation-label">NỘI DUNG</span>
          {(["vehicles", "articles"] as ContentTab[]).map((item) => (
            <Link
              aria-current={tab === item && !isOverview ? "page" : undefined}
              className={tab === item && !isOverview ? "active" : ""}
              href={pathByTab[item]}
              key={item}
            >
              <span className="admin-nav-icon">
                {item === "vehicles" ? "▰" : "▤"}
              </span>
              {tabLabels[item]}
              <small>{pageInfo[item].total}</small>
            </Link>
          ))}
          <span className="admin-navigation-label">PHÁP LÝ</span>
          {(["policies", "regulations", "legal_guides"] as ContentTab[]).map(
            (item) => (
              <Link
                aria-current={tab === item && !isOverview ? "page" : undefined}
                className={tab === item && !isOverview ? "active" : ""}
                href={pathByTab[item]}
                key={item}
              >
                <span className="admin-nav-icon">§</span>
                {tabLabels[item]}
                <small>{pageInfo[item].total}</small>
              </Link>
            ),
          )}
          <span className="admin-navigation-label">KHÁCH HÀNG & HỆ THỐNG</span>
          {(["contact_submissions", "activity"] as ContentTab[]).map((item) => (
            <Link
              aria-current={tab === item && !isOverview ? "page" : undefined}
              className={tab === item && !isOverview ? "active" : ""}
              href={pathByTab[item]}
              key={item}
            >
              <span className="admin-nav-icon">
                {item === "activity" ? "◷" : "✉"}
              </span>
              {tabLabels[item]}
              <small>{pageInfo[item].total}</small>
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <span className="admin-avatar">
            {username.slice(0, 1).toUpperCase() || "A"}
          </span>
          <span className="admin-user">
            <strong>{username || "Quản trị viên"}</strong>
            <small>Quản trị viên</small>
          </span>
          <button
            aria-label="Đăng xuất"
            className="admin-logout"
            onClick={() => void handleLogout()}
            title="Đăng xuất"
            type="button"
          >
            ↪
          </button>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="admin-eyebrow">
              {isOverview ? "TRUNG TÂM ĐIỀU HÀNH" : "QUẢN LÝ NỘI DUNG"}
            </span>
            <h1>{isOverview ? "Tổng quan" : tabLabels[tab]}</h1>
            <p className="admin-subtitle">
              {isOverview
                ? "Theo dõi nhanh tình hình nội dung và hoạt động quản trị."
                : pageDescriptions[tab]}
            </p>
          </div>
          <span className="admin-topbar-date">Hệ thống quản trị</span>
        </header>
        <div className="admin-content">
          {isOverview ? (
            <>
              {message && (
                <p
                  className={`admin-feedback${isError ? " admin-feedback-error" : ""}`}
                  role="status"
                >
                  {message}
                </p>
              )}
              <section className="admin-overview" aria-label="Chỉ số nội dung">
                {(
                  [
                    ["vehicles", "Danh mục xe", "Đang quản lý"],
                    ["articles", "Bài viết", "Đang quản lý"],
                    [
                      "policies",
                      "Tài liệu pháp lý",
                      `${pageInfo.regulations.total} quy định · ${pageInfo.legal_guides.total} hướng dẫn`,
                    ],
                    [
                      "contact_submissions",
                      "Yêu cầu liên hệ",
                      "Tổng số yêu cầu",
                    ],
                  ] as [ContentTab, string, string][]
                ).map(([item, label, detail]) => {
                  const count =
                    item === "policies"
                      ? pageInfo.policies.total +
                        pageInfo.regulations.total +
                        pageInfo.legal_guides.total
                      : pageInfo[item].total;
                  return (
                    <Link
                      className="admin-metric-card"
                      href={pathByTab[item]}
                      key={item}
                    >
                      <span className="admin-metric-icon">
                        {item === "vehicles"
                          ? "▰"
                          : item === "articles"
                            ? "▤"
                            : item === "contact_submissions"
                              ? "✉"
                              : "§"}
                      </span>
                      <span>{label}</span>
                      <strong>{count}</strong>
                      <small>{detail}</small>
                      <span className="admin-metric-link">Mở danh sách →</span>
                    </Link>
                  );
                })}
              </section>
              <section className="admin-overview-panels">
                <div className="admin-card admin-overview-panel">
                  <div className="admin-list-heading">
                    <div>
                      <h2>Yêu cầu liên hệ gần đây</h2>
                      <p>
                        Tối đa 5 yêu cầu mới nhất, sắp xếp theo thời gian gửi.
                      </p>
                    </div>
                    <Link href={pathByTab.contact_submissions}>Xem tất cả</Link>
                  </div>
                  {contactSubmissions.length === 0 ? (
                    <p className="admin-empty">Chưa có yêu cầu liên hệ nào.</p>
                  ) : (
                    <div className="admin-recent-list">
                      {contactSubmissions.slice(0, 5).map((submission) => (
                        <article key={submission.id}>
                          <span className="admin-recent-icon">✉</span>
                          <div>
                            <strong>{submission.name}</strong>
                            <small>
                              {submission.category} ·{" "}
                              {formatDate(submission.createdAt)}
                            </small>
                          </div>
                          <span
                            className={`admin-contact-status status-${submission.status}`}
                          >
                            {contactStatusLabel(submission.status)}
                          </span>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
                <div className="admin-card admin-overview-panel">
                  <div className="admin-list-heading">
                    <div>
                      <h2>Hoạt động quản trị</h2>
                      <p>Các thao tác được ghi nhận gần đây.</p>
                    </div>
                    <Link href={pathByTab.activity}>Xem lịch sử</Link>
                  </div>
                  {activity.length === 0 ? (
                    <p className="admin-empty">
                      Chưa có hoạt động được ghi nhận.
                    </p>
                  ) : (
                    <div className="admin-recent-list">
                      {activity.slice(0, 5).map((entry) => (
                        <article key={entry.id}>
                          <span className="admin-recent-icon">◷</span>
                          <div>
                            <strong>
                              {actionLabel(entry.action)} · {entry.entityLabel}
                            </strong>
                            <small>
                              {entry.actor} · {formatDate(entry.createdAt)}
                            </small>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </>
          ) : (
            <>
              <div className="admin-toolbar">
                <div>
                  <strong>{pageInfo[tab].total} mục</strong>
                  <span className="admin-toolbar-caption">
                    {tabLabels[tab]} trong hệ thống
                  </span>
                </div>
                <div className="admin-toolbar-actions">
                  {tab === "vehicles" && (
                    <button
                      className="admin-secondary-button"
                      disabled={isSaving}
                      onClick={() => void handleImportDefaults()}
                      type="button"
                    >
                      Nhập nội dung mẫu
                    </button>
                  )}
                  {tab !== "activity" && tab !== "contact_submissions" && (
                    <button
                      className="admin-primary-button"
                      onClick={startNew}
                      type="button"
                    >
                      + Tạo mới
                    </button>
                  )}
                </div>
              </div>
              {message && (
                <p
                  className={`admin-feedback${isError ? " admin-feedback-error" : ""}`}
                  role="status"
                >
                  {message}
                </p>
              )}
              {tab !== "activity" && (
                <label className="admin-search">
                  Tìm trong {tabLabels[tab].toLowerCase()}
                  <input
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Nhập tên, slug hoặc chuyên mục..."
                    value={search}
                  />
                </label>
              )}
              {pageInfo[tab].totalPages > 1 && (
                <nav
                  className="admin-pagination"
                  aria-label="Phân trang danh sách"
                >
                  <span>
                    Trang {currentPage}/{pageInfo[tab].totalPages} ·{" "}
                    {pageInfo[tab].total} mục
                  </span>
                  <div>
                    <button
                      disabled={currentPage <= 1}
                      onClick={() =>
                        void loadContent(currentPage - 1).catch(
                          (error: unknown) =>
                            showMessage(errorMessage(error), true),
                        )
                      }
                      type="button"
                    >
                      Trước
                    </button>
                    <button
                      disabled={currentPage >= pageInfo[tab].totalPages}
                      onClick={() =>
                        void loadContent(currentPage + 1).catch(
                          (error: unknown) =>
                            showMessage(errorMessage(error), true),
                        )
                      }
                      type="button"
                    >
                      Tiếp
                    </button>
                  </div>
                </nav>
              )}
              {tab === "contact_submissions" ? (
                <section className="admin-card admin-contacts">
                  <div className="admin-list-heading">
                    <div>
                      <h2>Yêu cầu tư vấn từ khách hàng</h2>
                      <p>
                        Chỉ dùng thông tin liên hệ để phản hồi yêu cầu. Lịch sử
                        hoạt động không lưu tên, số điện thoại hay nội dung liên
                        hệ.
                      </p>
                    </div>
                    <span>
                      {pageInfo.contact_submissions.total} yêu cầu phù hợp
                    </span>
                  </div>
                  <div className="admin-data-table-wrap">
                    <table className="admin-data-table admin-contact-table">
                      <thead>
                        <tr>
                          <th>Khách hàng</th>
                          <th>Liên hệ</th>
                          <th>Nhu cầu</th>
                          <th>Khu vực / xe</th>
                          <th>Nội dung</th>
                          <th>Ngày gửi</th>
                          <th>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredContactSubmissions.map((submission) => (
                          <tr key={submission.id}>
                            <td>
                              <strong>{submission.name}</strong>
                              <span
                                className={`admin-contact-status status-${submission.status}`}
                              >
                                {contactStatusLabel(submission.status)}
                              </span>
                            </td>
                            <td>
                              <a href={`tel:${submission.phone}`}>
                                {submission.phone}
                              </a>
                            </td>
                            <td>{submission.category}</td>
                            <td>
                              {submission.location || "—"}
                              {submission.vehicleSlug && (
                                <small>{submission.vehicleSlug}</small>
                              )}
                            </td>
                            <td className="admin-contact-message-cell">
                              {submission.message ? (
                                <details>
                                  <summary>
                                    {submission.message.slice(0, 80)}
                                    {submission.message.length > 80 ? "…" : ""}
                                  </summary>
                                  <p>{submission.message}</p>
                                  <hr />
                                  <strong>Thông tin đồng ý</strong>
                                  <p>{submission.consentText}</p>
                                  <small>
                                    Đồng ý lúc{" "}
                                    {formatDate(submission.consentAt)}
                                  </small>
                                </details>
                              ) : (
                                <span>Không có nội dung</span>
                              )}
                            </td>
                            <td>{formatDate(submission.createdAt)}</td>
                            <td>
                              <div className="admin-table-actions admin-contact-table-actions">
                                <label>
                                  <span className="sr-only">
                                    Trạng thái yêu cầu của {submission.name}
                                  </span>
                                  <select
                                    onChange={(event) =>
                                      void updateContactStatus(
                                        submission,
                                        event.target
                                          .value as ContactSubmission["status"],
                                      )
                                    }
                                    value={submission.status}
                                  >
                                    <option value="new">Mới</option>
                                    <option value="in_progress">
                                      Đang xử lý
                                    </option>
                                    <option value="contacted">
                                      Đã liên hệ
                                    </option>
                                    <option value="closed">Hoàn tất</option>
                                    <option value="spam">Spam</option>
                                  </select>
                                </label>
                                <button
                                  className="admin-table-button admin-table-danger"
                                  onClick={() =>
                                    void deleteContactSubmission(submission)
                                  }
                                  type="button"
                                >
                                  Xóa
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredContactSubmissions.length === 0 && (
                          <tr>
                            <td className="admin-table-empty" colSpan={7}>
                              {contactSubmissions.length === 0
                                ? "Chưa có yêu cầu liên hệ nào."
                                : "Không có yêu cầu nào khớp với từ khóa tìm kiếm."}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              ) : tab === "activity" ? (
                <section className="admin-card admin-activity">
                  <div className="admin-list-heading">
                    <div>
                      <h2>Lịch sử hoạt động</h2>
                      <p>
                        Ghi nhận đồng thời với thao tác dữ liệu; bản ghi này chỉ
                        xem, không thể sửa/xóa.
                      </p>
                    </div>
                    <span>{pageInfo.activity.total} sự kiện</span>
                  </div>
                  {activity.length === 0 ? (
                    <p className="admin-empty">
                      Chưa có hoạt động được ghi nhận.
                    </p>
                  ) : (
                    <div className="admin-activity-table-wrap">
                      <table className="admin-data-table admin-activity-table">
                        <thead>
                          <tr>
                            <th>Thời điểm</th>
                            <th>Người thực hiện</th>
                            <th>Thao tác</th>
                            <th>Đối tượng</th>
                            <th>Nội dung</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activity.map((entry) => (
                            <tr key={entry.id}>
                              <td>{formatDate(entry.createdAt)}</td>
                              <td>{entry.actor}</td>
                              <td>
                                <span
                                  className={`admin-action-badge admin-action-${entry.action.toLowerCase()}`}
                                >
                                  {actionLabel(entry.action)}
                                </span>
                              </td>
                              <td>{entityLabel(entry.entityType)}</td>
                              <td>{entry.entityLabel}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              ) : (
                <div className="admin-workspace">
                  {editorMode !== "closed" && (
                    <section className="admin-card admin-editor">
                      {tab === "vehicles" ? (
                        <form onSubmit={saveVehicle}>
                          <h2>{selectedId ? "Chỉnh sửa xe" : "Thêm xe"}</h2>
                          <div className="admin-form-grid">
                            <label>
                              Slug
                              <input
                                maxLength={120}
                                onChange={(event) =>
                                  setVehicleForm({
                                    ...vehicleForm,
                                    slug: event.target.value,
                                  })
                                }
                                required
                                value={vehicleForm.slug}
                              />
                            </label>
                            <label>
                              Tên xe
                              <input
                                maxLength={160}
                                onChange={(event) =>
                                  setVehicleForm({
                                    ...vehicleForm,
                                    name: event.target.value,
                                  })
                                }
                                required
                                value={vehicleForm.name}
                              />
                            </label>
                            <label>
                              Hãng xe
                              <input
                                onChange={(event) =>
                                  setVehicleForm({
                                    ...vehicleForm,
                                    make: event.target.value,
                                  })
                                }
                                required
                                value={vehicleForm.make}
                              />
                            </label>
                            <label>
                              Danh mục
                              <select
                                onChange={(event) =>
                                  setVehicleForm({
                                    ...vehicleForm,
                                    category: event.target.value,
                                  })
                                }
                                value={vehicleForm.category}
                              >
                                <option>Xe tải</option>
                                <option>Xe chữa cháy</option>
                                <option>Xe cứu hộ</option>
                                <option>Xe bồn / xe môi trường</option>
                              </select>
                            </label>
                            <label>
                              Kiểu minh họa
                              <select
                                onChange={(event) =>
                                  setVehicleForm({
                                    ...vehicleForm,
                                    artwork: event.target.value,
                                  })
                                }
                                value={vehicleForm.artwork}
                              >
                                <option value="cargo">Xe tải</option>
                                <option value="fire">Xe chữa cháy</option>
                                <option value="rescue">Xe cứu hộ</option>
                              </select>
                            </label>
                            <label>
                              Nhãn
                              <input
                                onChange={(event) =>
                                  setVehicleForm({
                                    ...vehicleForm,
                                    badge: event.target.value,
                                  })
                                }
                                required
                                value={vehicleForm.badge}
                              />
                            </label>
                            <label className="admin-full-width">
                              Mô tả
                              <textarea
                                onChange={(event) =>
                                  setVehicleForm({
                                    ...vehicleForm,
                                    description: event.target.value,
                                  })
                                }
                                required
                                rows={3}
                                value={vehicleForm.description}
                              />
                            </label>
                            <label className="admin-full-width">
                              Ảnh (mỗi dòng một URL HTTPS hoặc đường dẫn nội bộ)
                              <textarea
                                onChange={(event) =>
                                  setVehicleForm({
                                    ...vehicleForm,
                                    images: event.target.value,
                                  })
                                }
                                rows={3}
                                value={vehicleForm.images}
                              />
                            </label>
                            <label className="admin-full-width">
                              Mục đích sử dụng
                              <textarea
                                onChange={(event) =>
                                  setVehicleForm({
                                    ...vehicleForm,
                                    useCase: event.target.value,
                                  })
                                }
                                required
                                rows={2}
                                value={vehicleForm.useCase}
                              />
                            </label>
                            <label className="admin-full-width">
                              Điểm nổi bật (mỗi dòng một ý)
                              <textarea
                                onChange={(event) =>
                                  setVehicleForm({
                                    ...vehicleForm,
                                    highlights: event.target.value,
                                  })
                                }
                                required
                                rows={3}
                                value={vehicleForm.highlights}
                              />
                            </label>
                            <label className="admin-full-width">
                              Thông số (JSON dạng [
                              {`{"label":"Tên","value":"Giá trị"}`}])
                              <textarea
                                className="admin-code-input"
                                onChange={(event) =>
                                  setVehicleForm({
                                    ...vehicleForm,
                                    knownDetails: event.target.value,
                                  })
                                }
                                required
                                rows={6}
                                value={vehicleForm.knownDetails}
                              />
                            </label>
                            <label className="admin-full-width">
                              URL nguồn tham khảo
                              <input
                                onChange={(event) =>
                                  setVehicleForm({
                                    ...vehicleForm,
                                    sourceUrl: event.target.value,
                                  })
                                }
                                type="url"
                                value={vehicleForm.sourceUrl}
                              />
                            </label>
                          </div>
                          <label className="admin-publish-toggle">
                            <input
                              checked={vehicleForm.isPublished}
                              onChange={(event) =>
                                setVehicleForm({
                                  ...vehicleForm,
                                  isPublished: event.target.checked,
                                })
                              }
                              type="checkbox"
                            />{" "}
                            Hiển thị công khai
                          </label>
                          <div className="admin-form-actions">
                            <button
                              className="admin-primary-button"
                              disabled={isSaving}
                              type="submit"
                            >
                              {isSaving ? "Đang lưu..." : "Lưu xe"}
                            </button>
                            <button
                              className="admin-secondary-button"
                              onClick={closeEditor}
                              type="button"
                            >
                              Hủy
                            </button>
                          </div>
                        </form>
                      ) : tab === "articles" ? (
                        <form onSubmit={saveArticle}>
                          <h2>
                            {selectedId
                              ? "Chỉnh sửa bài viết"
                              : "Thêm bài viết"}
                          </h2>
                          <div className="admin-form-grid">
                            <label>
                              Slug
                              <input
                                maxLength={120}
                                onChange={(event) =>
                                  setArticleForm({
                                    ...articleForm,
                                    slug: event.target.value,
                                  })
                                }
                                required
                                value={articleForm.slug}
                              />
                            </label>
                            <label>
                              Chuyên mục
                              <input
                                onChange={(event) =>
                                  setArticleForm({
                                    ...articleForm,
                                    category: event.target.value,
                                  })
                                }
                                required
                                value={articleForm.category}
                              />
                            </label>
                            <label className="admin-full-width">
                              Tiêu đề
                              <input
                                onChange={(event) =>
                                  setArticleForm({
                                    ...articleForm,
                                    title: event.target.value,
                                  })
                                }
                                required
                                value={articleForm.title}
                              />
                            </label>
                            <label className="admin-full-width">
                              Mô tả ngắn
                              <textarea
                                onChange={(event) =>
                                  setArticleForm({
                                    ...articleForm,
                                    summary: event.target.value,
                                  })
                                }
                                required
                                rows={3}
                                value={articleForm.summary}
                              />
                            </label>
                            <label className="admin-full-width">
                              Nội dung (JSON: mảng các mục heading và
                              paragraphs)
                              <textarea
                                className="admin-code-input"
                                onChange={(event) =>
                                  setArticleForm({
                                    ...articleForm,
                                    sections: event.target.value,
                                  })
                                }
                                required
                                rows={12}
                                value={articleForm.sections}
                              />
                            </label>
                          </div>
                          <label className="admin-publish-toggle">
                            <input
                              checked={articleForm.isPublished}
                              onChange={(event) =>
                                setArticleForm({
                                  ...articleForm,
                                  isPublished: event.target.checked,
                                })
                              }
                              type="checkbox"
                            />{" "}
                            Hiển thị công khai
                          </label>
                          <div className="admin-form-actions">
                            <button
                              className="admin-primary-button"
                              disabled={isSaving}
                              type="submit"
                            >
                              {isSaving ? "Đang lưu..." : "Lưu bài viết"}
                            </button>
                            <button
                              className="admin-secondary-button"
                              onClick={closeEditor}
                              type="button"
                            >
                              Hủy
                            </button>
                          </div>
                        </form>
                      ) : (
                        <form onSubmit={saveLegalResource}>
                          <h2>
                            {selectedId
                              ? "Chỉnh sửa tài liệu"
                              : `Thêm ${tabLabels[tab].toLowerCase()}`}
                          </h2>
                          <p className="admin-form-note">
                            Chỉ công bố thông tin đã được đơn vị có trách nhiệm
                            xác minh. Nội dung pháp lý trên website không thay
                            thế tư vấn pháp luật.
                          </p>
                          <div className="admin-form-grid">
                            <label>
                              Slug
                              <input
                                maxLength={120}
                                onChange={(event) =>
                                  setLegalResourceForm({
                                    ...legalResourceForm,
                                    slug: event.target.value,
                                  })
                                }
                                required
                                value={legalResourceForm.slug}
                              />
                            </label>
                            <label>
                              Tiêu đề
                              <input
                                maxLength={250}
                                onChange={(event) =>
                                  setLegalResourceForm({
                                    ...legalResourceForm,
                                    title: event.target.value,
                                  })
                                }
                                required
                                value={legalResourceForm.title}
                              />
                            </label>
                            <label className="admin-full-width">
                              Tóm tắt
                              <textarea
                                maxLength={2000}
                                onChange={(event) =>
                                  setLegalResourceForm({
                                    ...legalResourceForm,
                                    summary: event.target.value,
                                  })
                                }
                                required
                                rows={2}
                                value={legalResourceForm.summary}
                              />
                            </label>
                            <label className="admin-full-width">
                              Nội dung
                              <textarea
                                maxLength={20000}
                                onChange={(event) =>
                                  setLegalResourceForm({
                                    ...legalResourceForm,
                                    content: event.target.value,
                                  })
                                }
                                required
                                rows={9}
                                value={legalResourceForm.content}
                              />
                            </label>
                            {(tab === "regulations" ||
                              tab === "legal_guides") && (
                              <label className="admin-full-width">
                                Nguồn tham khảo chính thức
                                <input
                                  onChange={(event) =>
                                    setLegalResourceForm({
                                      ...legalResourceForm,
                                      sourceUrl: event.target.value,
                                    })
                                  }
                                  placeholder="https://"
                                  type="url"
                                  value={legalResourceForm.sourceUrl}
                                />
                              </label>
                            )}
                          </div>
                          <label className="admin-publish-toggle">
                            <input
                              checked={legalResourceForm.isPublished}
                              onChange={(event) =>
                                setLegalResourceForm({
                                  ...legalResourceForm,
                                  isPublished: event.target.checked,
                                })
                              }
                              type="checkbox"
                            />{" "}
                            Hiển thị công khai
                          </label>
                          <div className="admin-form-actions">
                            <button
                              className="admin-primary-button"
                              disabled={isSaving}
                              type="submit"
                            >
                              {isSaving ? "Đang lưu..." : "Lưu tài liệu"}
                            </button>
                            <button
                              className="admin-secondary-button"
                              onClick={closeEditor}
                              type="button"
                            >
                              Hủy
                            </button>
                          </div>
                        </form>
                      )}
                    </section>
                  )}
                  <section className="admin-card admin-list">
                    <div className="admin-list-heading">
                      <h2>{tabLabels[tab]}</h2>
                      <span>{visibleCount} mục</span>
                    </div>
                    <div className="admin-data-table-wrap">
                      <table className="admin-data-table">
                        <thead>
                          <tr>
                            {tab === "vehicles" ? (
                              <>
                                <th>Tên xe</th>
                                <th>Hãng xe</th>
                                <th>Danh mục</th>
                                <th>Trạng thái</th>
                              </>
                            ) : tab === "articles" ? (
                              <>
                                <th>Tiêu đề bài viết</th>
                                <th>Chuyên mục</th>
                                <th>Slug</th>
                                <th>Trạng thái</th>
                              </>
                            ) : (
                              <>
                                <th>Tên tài liệu</th>
                                <th>Slug</th>
                                <th>Tóm tắt</th>
                                <th>Trạng thái</th>
                              </>
                            )}
                            <th>Hành động</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tab === "vehicles"
                            ? filteredVehicles.map((vehicle) => (
                                <tr key={vehicle.id}>
                                  <td>
                                    <strong>{vehicle.name}</strong>
                                    <small>{vehicle.slug}</small>
                                  </td>
                                  <td>{vehicle.make}</td>
                                  <td>{vehicle.category}</td>
                                  <td>
                                    <span
                                      className={`admin-table-status ${vehicle.isPublished ? "is-published" : ""}`}
                                    >
                                      {vehicle.isPublished
                                        ? "Đang công khai"
                                        : "Bản nháp"}
                                    </span>
                                  </td>
                                  <td>
                                    <div className="admin-table-actions">
                                      <button
                                        className="admin-table-button"
                                        onClick={() => setDetailItem(vehicle)}
                                        type="button"
                                      >
                                        Chi tiết
                                      </button>
                                      <button
                                        className="admin-table-button"
                                        onClick={() => editVehicle(vehicle)}
                                        type="button"
                                      >
                                        Sửa
                                      </button>
                                      <button
                                        className="admin-table-button admin-table-danger"
                                        onClick={() =>
                                          void deleteItem(
                                            "vehicles",
                                            vehicle.id,
                                            vehicle.name,
                                          )
                                        }
                                        type="button"
                                      >
                                        Xóa
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            : tab === "articles"
                              ? filteredArticles.map((article) => (
                                  <tr key={article.id}>
                                    <td>
                                      <strong>{article.title}</strong>
                                    </td>
                                    <td>{article.category}</td>
                                    <td>
                                      <code>{article.slug}</code>
                                    </td>
                                    <td>
                                      <span
                                        className={`admin-table-status ${article.isPublished ? "is-published" : ""}`}
                                      >
                                        {article.isPublished
                                          ? "Đang công khai"
                                          : "Bản nháp"}
                                      </span>
                                    </td>
                                    <td>
                                      <div className="admin-table-actions">
                                        <button
                                          className="admin-table-button"
                                          onClick={() => setDetailItem(article)}
                                          type="button"
                                        >
                                          Chi tiết
                                        </button>
                                        <button
                                          className="admin-table-button"
                                          onClick={() => editArticle(article)}
                                          type="button"
                                        >
                                          Sửa
                                        </button>
                                        <button
                                          className="admin-table-button admin-table-danger"
                                          onClick={() =>
                                            void deleteItem(
                                              "articles",
                                              article.id,
                                              article.title,
                                            )
                                          }
                                          type="button"
                                        >
                                          Xóa
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              : filteredResources.map((resource) => (
                                  <tr key={resource.id}>
                                    <td>
                                      <strong>{resource.title}</strong>
                                      <small>
                                        {resource.resourceType === "policy"
                                          ? "Chính sách"
                                          : resource.resourceType ===
                                              "regulation"
                                            ? "Quy định"
                                            : "Tìm hiểu pháp lý"}
                                      </small>
                                    </td>
                                    <td>
                                      <code>{resource.slug}</code>
                                    </td>
                                    <td className="admin-table-summary">
                                      {resource.summary || "—"}
                                    </td>
                                    <td>
                                      <span
                                        className={`admin-table-status ${resource.isPublished ? "is-published" : ""}`}
                                      >
                                        {resource.isPublished
                                          ? "Đang công khai"
                                          : "Bản nháp"}
                                      </span>
                                    </td>
                                    <td>
                                      <div className="admin-table-actions">
                                        <button
                                          className="admin-table-button"
                                          onClick={() =>
                                            setDetailItem(resource)
                                          }
                                          type="button"
                                        >
                                          Chi tiết
                                        </button>
                                        <button
                                          className="admin-table-button"
                                          onClick={() =>
                                            editLegalResource(resource)
                                          }
                                          type="button"
                                        >
                                          Sửa
                                        </button>
                                        <button
                                          className="admin-table-button admin-table-danger"
                                          onClick={() =>
                                            void deleteItem(
                                              "legal-resources",
                                              resource.id,
                                              resource.title,
                                            )
                                          }
                                          type="button"
                                        >
                                          Xóa
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                          {(tab === "vehicles" &&
                            filteredVehicles.length === 0) ||
                          (tab === "articles" &&
                            filteredArticles.length === 0) ||
                          ((tab === "policies" ||
                            tab === "regulations" ||
                            tab === "legal_guides") &&
                            filteredResources.length === 0) ? (
                            <tr>
                              <td className="admin-table-empty" colSpan={5}>
                                Không có mục phù hợp. Hãy tạo nội dung mới hoặc
                                điều chỉnh từ khóa tìm kiếm.
                              </td>
                            </tr>
                          ) : null}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {detailItem && (
        <div
          className="admin-detail-backdrop"
          onClick={() => setDetailItem(null)}
          role="presentation"
        >
          <section
            aria-labelledby="admin-detail-title"
            aria-modal="true"
            className="admin-detail-dialog"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <header className="admin-detail-header">
              <div>
                <span className="admin-eyebrow">HỒ SƠ NỘI DUNG</span>
                <h2 id="admin-detail-title">
                  {"name" in detailItem ? detailItem.name : detailItem.title}
                </h2>
                <span className="admin-detail-slug">/{detailItem.slug}</span>
              </div>
              <button
                aria-label="Đóng chi tiết"
                className="admin-detail-close"
                onClick={() => setDetailItem(null)}
                type="button"
              >
                ×
              </button>
            </header>
            <div className="admin-detail-body">
              <div className="admin-detail-status-row">
                <span
                  className={`admin-detail-publish ${detailItem.isPublished ? "is-published" : ""}`}
                >
                  {detailItem.isPublished ? "Đang công khai" : "Bản nháp"}
                </span>
                {"resourceType" in detailItem && (
                  <span className="admin-detail-type">
                    {detailItem.resourceType === "policy"
                      ? "Chính sách"
                      : detailItem.resourceType === "regulation"
                        ? "Quy định"
                        : "Tìm hiểu pháp lý"}
                  </span>
                )}
              </div>
              {"resourceType" in detailItem ? (
                <dl className="admin-detail-grid">
                  <div>
                    <dt>Tiêu đề</dt>
                    <dd>{detailItem.title}</dd>
                  </div>
                  <div>
                    <dt>Slug</dt>
                    <dd>{detailItem.slug}</dd>
                  </div>
                  <div className="admin-detail-full">
                    <dt>Tóm tắt</dt>
                    <dd>{detailItem.summary || "Chưa có tóm tắt."}</dd>
                  </div>
                  <div className="admin-detail-full">
                    <dt>Nội dung chi tiết</dt>
                    <dd className="admin-detail-prose">{detailItem.content}</dd>
                  </div>
                  {detailItem.sourceUrl && (
                    <div className="admin-detail-full">
                      <dt>Nguồn tham khảo</dt>
                      <dd>
                        <a
                          href={detailItem.sourceUrl}
                          rel="noreferrer"
                          target="_blank"
                        >
                          {detailItem.sourceUrl}
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
              ) : "sections" in detailItem ? (
                <dl className="admin-detail-grid">
                  <div>
                    <dt>Chuyên mục</dt>
                    <dd>{detailItem.category}</dd>
                  </div>
                  <div>
                    <dt>Slug</dt>
                    <dd>{detailItem.slug}</dd>
                  </div>
                  <div className="admin-detail-full">
                    <dt>Tóm tắt</dt>
                    <dd>{detailItem.summary || "Chưa có tóm tắt."}</dd>
                  </div>
                  <div className="admin-detail-full">
                    <dt>Nội dung bài viết</dt>
                    <dd className="admin-detail-sections">
                      {detailItem.sections.map((section, index) => (
                        <section key={`${section.heading}-${index}`}>
                          <h3>{section.heading || `Phần ${index + 1}`}</h3>
                          {section.paragraphs.map(
                            (paragraph, paragraphIndex) => (
                              <p
                                key={`${paragraphIndex}-${paragraph.slice(0, 20)}`}
                              >
                                {paragraph}
                              </p>
                            ),
                          )}
                        </section>
                      ))}
                    </dd>
                  </div>
                </dl>
              ) : (
                <dl className="admin-detail-grid">
                  <div>
                    <dt>Hãng xe</dt>
                    <dd>{detailItem.make}</dd>
                  </div>
                  <div>
                    <dt>Danh mục</dt>
                    <dd>{detailItem.category}</dd>
                  </div>
                  <div>
                    <dt>Nhãn</dt>
                    <dd>{detailItem.badge}</dd>
                  </div>
                  <div>
                    <dt>Kiểu minh họa</dt>
                    <dd>{detailItem.artwork}</dd>
                  </div>
                  <div className="admin-detail-full">
                    <dt>Mô tả</dt>
                    <dd className="admin-detail-prose">
                      {detailItem.description}
                    </dd>
                  </div>
                  <div className="admin-detail-full">
                    <dt>Mục đích sử dụng</dt>
                    <dd className="admin-detail-prose">{detailItem.useCase}</dd>
                  </div>
                  <div>
                    <dt>Điểm nổi bật</dt>
                    <dd>
                      {detailItem.highlights.length > 0 ? (
                        <ul>
                          {detailItem.highlights.map((highlight) => (
                            <li key={highlight}>{highlight}</li>
                          ))}
                        </ul>
                      ) : (
                        "Chưa có thông tin."
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>Thông số</dt>
                    <dd>
                      {detailItem.knownDetails.length > 0 ? (
                        <dl className="admin-detail-specs">
                          {detailItem.knownDetails.map((spec) => (
                            <div key={spec.label}>
                              <dt>{spec.label}</dt>
                              <dd>{spec.value}</dd>
                            </div>
                          ))}
                        </dl>
                      ) : (
                        "Chưa có thông số."
                      )}
                    </dd>
                  </div>
                  <div className="admin-detail-full">
                    <dt>Hình ảnh</dt>
                    <dd>
                      {detailItem.images.length > 0 ? (
                        <ul className="admin-detail-images">
                          {detailItem.images.map((image) => (
                            <li key={image}>{image}</li>
                          ))}
                        </ul>
                      ) : (
                        "Chưa có hình ảnh."
                      )}
                    </dd>
                  </div>
                  {detailItem.sourceUrl && (
                    <div className="admin-detail-full">
                      <dt>Nguồn tham khảo</dt>
                      <dd>
                        <a
                          href={detailItem.sourceUrl}
                          rel="noreferrer"
                          target="_blank"
                        >
                          {detailItem.sourceUrl}
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
              )}
            </div>
            <footer className="admin-detail-footer">
              <button
                className="admin-secondary-button"
                onClick={() => setDetailItem(null)}
                type="button"
              >
                Đóng
              </button>
              <button
                className="admin-primary-button"
                onClick={() => {
                  if ("resourceType" in detailItem) {
                    editLegalResource(detailItem);
                  } else if ("sections" in detailItem) {
                    editArticle(detailItem);
                  } else {
                    editVehicle(detailItem);
                  }
                }}
                type="button"
              >
                Sửa thông tin
              </button>
            </footer>
          </section>
        </div>
      )}
    </main>
  );
}

class AdminApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function apiRequest<T = void>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(
    path.startsWith("/session/")
      ? `/api/admin${path}`
      : `/api/admin/content${path}`,
    {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
      cache: "no-store",
    },
  );
  const result: unknown =
    response.status === 204 ? undefined : await response.json();
  if (!response.ok) {
    const message =
      isRecord(result) && typeof result.message === "string"
        ? result.message
        : `Yêu cầu thất bại (${response.status}).`;
    throw new AdminApiError(message, response.status);
  }
  return result as T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Đã xảy ra lỗi khi xử lý yêu cầu.";
}

function lines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function actionLabel(action: ActivityEntry["action"]) {
  const labels: Record<ActivityEntry["action"], string> = {
    CREATE: "Tạo mới",
    UPDATE: "Cập nhật",
    DELETE: "Xóa",
    IMPORT: "Nhập dữ liệu",
  };
  return labels[action];
}

function entityLabel(entity: ActivityEntry["entityType"]) {
  const labels: Record<ActivityEntry["entityType"], string> = {
    vehicle: "Xe",
    article: "Bài viết",
    policy: "Chính sách",
    regulation: "Quy định",
    legal_guide: "Tìm hiểu pháp lý",
    contact_submission: "Yêu cầu liên hệ",
    system: "Hệ thống",
  };
  return labels[entity];
}

function contactStatusLabel(status: ContactSubmission["status"]) {
  const labels: Record<ContactSubmission["status"], string> = {
    new: "Mới",
    in_progress: "Đang xử lý",
    contacted: "Đã liên hệ",
    closed: "Hoàn tất",
    spam: "Spam",
  };
  return labels[status];
}
