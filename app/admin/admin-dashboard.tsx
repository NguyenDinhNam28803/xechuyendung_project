"use client";

import { useEffect, useState, type FormEvent } from "react";
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

const resourceTypeByTab: Record<LegalResourceTab, LegalResourceType> = {
  policies: "policy",
  regulations: "regulation",
  legal_guides: "legal_guide",
};

export default function AdminDashboard() {
  const [vehicles, setVehicles] = useState<AdminVehicle[]>([]);
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [legalResources, setLegalResources] = useState<AdminLegalResource[]>(
    [],
  );
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<
    ContactSubmission[]
  >([]);
  const [tab, setTab] = useState<ContentTab>("vehicles");
  const [vehicleForm, setVehicleForm] = useState(emptyVehicle);
  const [articleForm, setArticleForm] = useState(emptyArticle);
  const [legalResourceForm, setLegalResourceForm] =
    useState(emptyLegalResource);
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    void loadContent()
      .then(() => setAuthenticated(true))
      .catch((error: unknown) => {
        if (!(error instanceof AdminApiError) || error.status !== 401) {
          showMessage(errorMessage(error), true);
        }
      })
      .finally(() => setCheckingSession(false));
  }, []);

  function showMessage(nextMessage: string, error = false) {
    setMessage(nextMessage);
    setIsError(error);
  }

  async function loadContent() {
    const [
      nextVehicles,
      nextArticles,
      nextLegalResources,
      nextActivity,
      nextContactSubmissions,
    ] = await Promise.all([
      apiRequest<AdminVehicle[]>("/vehicles"),
      apiRequest<AdminArticle[]>("/articles"),
      apiRequest<AdminLegalResource[]>("/legal-resources"),
      apiRequest<ActivityEntry[]>("/activity"),
      apiRequest<ContactSubmission[]>("/contact-submissions"),
    ]);
    setVehicles(nextVehicles);
    setArticles(nextArticles);
    setLegalResources(nextLegalResources);
    setActivity(nextActivity);
    setContactSubmissions(nextContactSubmissions);
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    showMessage("");
    try {
      await apiRequest<{ ok: boolean }>("/session/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      await loadContent();
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
    setVehicleForm({ ...emptyVehicle });
    setArticleForm({ ...emptyArticle });
    setLegalResourceForm({ ...emptyLegalResource });
    showMessage("");
  }

  function selectTab(nextTab: ContentTab) {
    setTab(nextTab);
    setSearch("");
    startNew();
  }

  function editVehicle(vehicle: AdminVehicle) {
    setTab("vehicles");
    setSelectedId(vehicle.id);
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
    setTab("articles");
    setSelectedId(article.id);
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
    setTab(nextTab);
    setSelectedId(resource.id);
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
      startNew();
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
      startNew();
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
      startNew();
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
      if (selectedId === id) startNew();
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
  const visibleCount =
    tab === "vehicles"
      ? vehicles.length
      : tab === "articles"
        ? articles.length
        : tab === "contact_submissions"
          ? contactSubmissions.length
          : tab === "activity"
            ? activity.length
            : visibleResources.length;
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
      <header className="admin-topbar">
        <div>
          <span className="admin-eyebrow">QUẢN TRỊ NỘI DUNG</span>
          <h1>Xe Chuyên Dụng</h1>
          <p className="admin-subtitle">
            Quản lý nội dung website, tài liệu pháp lý và lịch sử thao tác.
          </p>
        </div>
        <button
          className="admin-secondary-button"
          onClick={() => void handleLogout()}
          type="button"
        >
          Đăng xuất
        </button>
      </header>
      <section className="admin-overview" aria-label="Tổng quan nội dung">
        <article>
          <span>Xe</span>
          <strong>{vehicles.length}</strong>
          <small>
            {vehicles.filter((item) => item.isPublished).length} đang công khai
          </small>
        </article>
        <article>
          <span>Bài viết</span>
          <strong>{articles.length}</strong>
          <small>
            {articles.filter((item) => item.isPublished).length} đang công khai
          </small>
        </article>
        <article>
          <span>Tài liệu pháp lý</span>
          <strong>{legalResources.length}</strong>
          <small>
            {legalResources.filter((item) => item.isPublished).length} đang công
            khai
          </small>
        </article>
        <article>
          <span>Hoạt động gần đây</span>
          <strong>{activity.length}</strong>
          <small>Tối đa 100 sự kiện mới nhất</small>
        </article>
      </section>
      <div className="admin-toolbar">
        <div className="admin-tabs" role="tablist" aria-label="Loại nội dung">
          {(
            [
              "vehicles",
              "articles",
              "policies",
              "regulations",
              "legal_guides",
              "contact_submissions",
              "activity",
            ] as ContentTab[]
          ).map((item) => {
            const count =
              item === "vehicles"
                ? vehicles.length
                : item === "articles"
                  ? articles.length
                  : item === "contact_submissions"
                    ? contactSubmissions.length
                    : item === "activity"
                      ? activity.length
                      : legalResources.filter(
                          (resource) =>
                            resource.resourceType === resourceTypeByTab[item],
                        ).length;
            return (
              <button
                aria-selected={tab === item}
                key={item}
                onClick={() => selectTab(item)}
                role="tab"
                type="button"
              >
                {tabLabels[item]} ({count})
              </button>
            );
          })}
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
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nhập tên, slug hoặc chuyên mục..."
            value={search}
          />
        </label>
      )}
      {tab === "contact_submissions" ? (
        <section className="admin-card admin-contacts">
          <div className="admin-list-heading">
            <div>
              <h2>Yêu cầu tư vấn từ khách hàng</h2>
              <p>
                Chỉ dùng thông tin liên hệ để phản hồi yêu cầu. Lịch sử hoạt
                động không lưu tên, số điện thoại hay nội dung liên hệ.
              </p>
            </div>
            <span>{contactSubmissions.length} yêu cầu gần nhất</span>
          </div>
          <div className="admin-contact-list">
            {filteredContactSubmissions.map((submission) => (
              <article className="admin-contact-item" key={submission.id}>
                <div className="admin-contact-main">
                  <div className="admin-contact-heading">
                    <strong>{submission.name}</strong>
                    <span
                      className={`admin-contact-status status-${submission.status}`}
                    >
                      {contactStatusLabel(submission.status)}
                    </span>
                  </div>
                  <div className="admin-contact-meta">
                    <a href={`tel:${submission.phone}`}>{submission.phone}</a>
                    <span>{submission.category}</span>
                    <span>{formatDate(submission.createdAt)}</span>
                  </div>
                  {(submission.location || submission.vehicleSlug) && (
                    <p>
                      {submission.location && `Khu vực: ${submission.location}`}
                      {submission.location && submission.vehicleSlug && " · "}
                      {submission.vehicleSlug &&
                        `Xe quan tâm: ${submission.vehicleSlug}`}
                    </p>
                  )}
                  {submission.message && (
                    <p className="admin-contact-message">
                      {submission.message}
                    </p>
                  )}
                  <details>
                    <summary>Thông tin đồng ý và lưu trữ</summary>
                    <p>{submission.consentText}</p>
                    <small>Đồng ý lúc {formatDate(submission.consentAt)}</small>
                  </details>
                </div>
                <div className="admin-contact-actions">
                  <label className="admin-contact-status-control">
                    Trạng thái
                    <select
                      onChange={(event) =>
                        void updateContactStatus(
                          submission,
                          event.target.value as ContactSubmission["status"],
                        )
                      }
                      value={submission.status}
                    >
                      <option value="new">Mới</option>
                      <option value="in_progress">Đang xử lý</option>
                      <option value="contacted">Đã liên hệ</option>
                      <option value="closed">Hoàn tất</option>
                      <option value="spam">Spam</option>
                    </select>
                  </label>
                  <button
                    className="admin-danger-button"
                    onClick={() => void deleteContactSubmission(submission)}
                    type="button"
                  >
                    Xóa dữ liệu
                  </button>
                </div>
              </article>
            ))}
            {filteredContactSubmissions.length === 0 && (
              <p className="admin-empty">
                {contactSubmissions.length === 0
                  ? "Chưa có yêu cầu liên hệ nào."
                  : "Không có yêu cầu nào khớp với từ khóa tìm kiếm."}
              </p>
            )}
          </div>
        </section>
      ) : tab === "activity" ? (
        <section className="admin-card admin-activity">
          <div className="admin-list-heading">
            <div>
              <h2>Lịch sử hoạt động</h2>
              <p>
                Ghi nhận đồng thời với thao tác dữ liệu; bản ghi này chỉ xem,
                không thể sửa/xóa.
              </p>
            </div>
            <span>{activity.length} sự kiện</span>
          </div>
          {activity.length === 0 ? (
            <p className="admin-empty">Chưa có hoạt động được ghi nhận.</p>
          ) : (
            <div className="admin-activity-table-wrap">
              <table className="admin-activity-table">
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
                    Thông số (JSON dạng [{`{"label":"Tên","value":"Giá trị"}`}])
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
                    onClick={startNew}
                    type="button"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            ) : tab === "articles" ? (
              <form onSubmit={saveArticle}>
                <h2>{selectedId ? "Chỉnh sửa bài viết" : "Thêm bài viết"}</h2>
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
                    Nội dung (JSON: mảng các mục heading và paragraphs)
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
                    onClick={startNew}
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
                  Chỉ công bố thông tin đã được đơn vị có trách nhiệm xác minh.
                  Nội dung pháp lý trên website không thay thế tư vấn pháp luật.
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
                  {(tab === "regulations" || tab === "legal_guides") && (
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
                    onClick={startNew}
                    type="button"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            )}
          </section>
          <section className="admin-card admin-list">
            <div className="admin-list-heading">
              <h2>{tabLabels[tab]}</h2>
              <span>{visibleCount} mục</span>
            </div>
            <div className="admin-list-items">
              {tab === "vehicles"
                ? filteredVehicles.map((vehicle) => (
                    <article className="admin-list-item" key={vehicle.id}>
                      <div>
                        <strong>{vehicle.name}</strong>
                        <span>
                          {vehicle.make} · {vehicle.category} ·{" "}
                          {vehicle.isPublished ? "Đang hiển thị" : "Bản nháp"}
                        </span>
                      </div>
                      <div className="admin-item-actions">
                        <button
                          onClick={() => editVehicle(vehicle)}
                          type="button"
                        >
                          Sửa
                        </button>
                        <button
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
                    </article>
                  ))
                : tab === "articles"
                  ? filteredArticles.map((article) => (
                      <article className="admin-list-item" key={article.id}>
                        <div>
                          <strong>{article.title}</strong>
                          <span>
                            {article.category} ·{" "}
                            {article.isPublished ? "Đang hiển thị" : "Bản nháp"}
                          </span>
                        </div>
                        <div className="admin-item-actions">
                          <button
                            onClick={() => editArticle(article)}
                            type="button"
                          >
                            Sửa
                          </button>
                          <button
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
                      </article>
                    ))
                  : filteredResources.map((resource) => (
                      <article className="admin-list-item" key={resource.id}>
                        <div>
                          <strong>{resource.title}</strong>
                          <span>
                            {resource.slug} ·{" "}
                            {resource.isPublished
                              ? "Đang hiển thị"
                              : "Bản nháp"}
                          </span>
                        </div>
                        <div className="admin-item-actions">
                          <button
                            onClick={() => editLegalResource(resource)}
                            type="button"
                          >
                            Sửa
                          </button>
                          <button
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
                      </article>
                    ))}
              {((tab === "vehicles" && filteredVehicles.length === 0) ||
                (tab === "articles" && filteredArticles.length === 0) ||
                ((tab === "policies" ||
                  tab === "regulations" ||
                  tab === "legal_guides") &&
                  filteredResources.length === 0)) && (
                <p className="admin-empty">
                  Không có mục phù hợp. Hãy tạo nội dung mới hoặc điều chỉnh từ
                  khóa tìm kiếm.
                </p>
              )}
            </div>
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
