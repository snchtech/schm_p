CREATE TABLE ALBUM (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    depart_id INT,
    unit_id INT,
    description VARCHAR(1000),
    date_create DATETIME,
    date_update DATETIME,
    version INT,
    stable BOOLEAN
);

CREATE TABLE ALBUM_DOCUMENTS (
    id INT PRIMARY KEY,
    album_id INT REFERENCES ALBUM(id),
    document_id INT,
    date_confirm DATETIME
);

CREATE TABLE SCHEME (
    id INT PRIMARY KEY,
    album_id INT REFERENCES ALBUM(id),
    name VARCHAR(255),
    depart_id INT,
    unit_id INT,
    description VARCHAR(1000),
    date_create DATETIME,
    date_update DATETIME,
    stable BOOLEAN,
    format VARCHAR(50),
    page_number INT,
    system VARCHAR(255),
    shifr VARCHAR(255)
);

CREATE TABLE SCHEME_DOCUMENTS (
    id INT PRIMARY KEY,
    scheme_id INT REFERENCES SCHEME(id),
    file_name VARCHAR(255),
    file_id BLOB,
    date_update DATETIME,
    editor_number INT
);

CREATE TABLE SCHEME_VERSION (
    id INT PRIMARY KEY,
    scheme_id INT REFERENCES SCHEME(id),
    scheme_data TEXT,
    date_update DATETIME,
    stable BOOLEAN
);

-- Table SCHEME_NOTE
CREATE TABLE SCHEME_NOTE (
    id INT PRIMARY KEY,
    note_text TEXT
);

-- Table NOTE_SCHEME
CREATE TABLE NOTE_SCHEME (
    id INT PRIMARY KEY,
    scheme_id INT REFERENCES SCHEME(id),
    note_id INT REFERENCES SCHEME_NOTE(id)
);

-- Table SCHEME_TABLE_INFO
CREATE TABLE SCHEME_TABLE_INFO (
    id INT PRIMARY KEY,
    position INT,
    label VARCHAR(255),
    name VARCHAR(255),
    count INT,
    info VARCHAR(1000)
);

-- Table TABLE_SCHEME
CREATE TABLE TABLE_SCHEME (
    id INT PRIMARY KEY,
    id_scheme INT REFERENCES SCHEME(id),
    id_table_info INT REFERENCES SCHEME_TABLE_INFO(id)
);

-- Table ELEMENT
CREATE TABLE ELEMENT (
    id INT PRIMARY KEY,
    scheme_id INT REFERENCES SCHEME(id),
    album_id INT REFERENCES ALBUM(id),
    name VARCHAR(255),
    status_id INT,
    department_id INT,
    unit_id INT,
    date_update DATETIME,
    group_id INT,
    element_type INT,
    x_position FLOAT,
    y_position FLOAT,
    width FLOAT,
    height FLOAT,
    radius FLOAT,
    fill_color VARCHAR(255),
    created_at DATETIME,
    element_blob BLOB,
    show_status BOOLEAN
);

-- Table ELEMENT_STATUS
CREATE TABLE ELEMENT_STATUS (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    color_id INT
);

-- Table ELEMENT_TYPE
CREATE TABLE ELEMENT_TYPE (
    id INT PRIMARY KEY,
    name VARCHAR(255)
);

-- Table ELEMENT_TEXT
CREATE TABLE ELEMENT_TEXT (
    id INT PRIMARY KEY,
    text_element_id INT,
    element_id INT REFERENCES ELEMENT(id)
);

-- Table UBDN_ELEMENT
CREATE TABLE UBDN_ELEMENT (
    id INT PRIMARY KEY,
    elem_id INT REFERENCES ELEMENT(id),
    ubdn_id INT
);

-- Table UBDN_STATUS_LOG
CREATE TABLE UBDN_STATUS_LOG (
    id INT PRIMARY KEY,
    ubdn_id INT,
    status VARCHAR(255),
    date_update DATETIME,
    system_id INT REFERENCES SYSTEMS(id),
    source_id INT
);

-- Table SYSTEMS
CREATE TABLE SYSTEMS (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    description VARCHAR(1000),
    type VARCHAR(255),
    status BOOLEAN
);

-- Table SYSTEM_SOURCE
CREATE TABLE SYSTEM_SOURCE (
    id INT PRIMARY KEY,
    system_id INT REFERENCES SYSTEMS(id),
    source VARCHAR(255)
);

-- Table PLACE_ELEMENT
CREATE TABLE PLACE_ELEMENT (
    id INT PRIMARY KEY,
    elem_id INT REFERENCES ELEMENT(id),
    place_id INT
);

-- Table GROUP_ELEMENT
CREATE TABLE GROUP_ELEMENT (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    type_id INT REFERENCES GROUP_TYPE(id)
);

-- Table GROUP_TYPE
CREATE TABLE GROUP_TYPE (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    description VARCHAR(1000)
);

-- Table ELEMENT_OPTION
CREATE TABLE ELEMENT_OPTION (
    id INT PRIMARY KEY,
    element_id INT REFERENCES ELEMENT(id),
    option_id INT REFERENCES ELEMENT_OPTION_LIBRARY(id),
    option_value VARCHAR(255)
);

-- Table ELEMENT_OPTION_LIBRARY
CREATE TABLE ELEMENT_OPTION_LIBRARY (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    description VARCHAR(1000),
    unit_measurement VARCHAR(255)
);

-- Table ELEMENT_MARK
CREATE TABLE ELEMENT_MARK (
    id INT PRIMARY KEY,
    element_id INT REFERENCES ELEMENT(id),
    mark_id INT REFERENCES MARK(id)
);

-- Table MARK
CREATE TABLE MARK (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    type VARCHAR(255),
    mark_blob BLOB
);

-- Table ZVT
CREATE TABLE ZVT (
    id INT PRIMARY KEY,
    param_type_id INT REFERENCES ZVT_PARAMETR(id),
    location_id INT REFERENCES ZVT_LOCATION(id),
    indicator_id INT REFERENCES ZVT_INDICATOR(id),
    ios_status BOOLEAN
);

-- Table ZVT_PARAMETR
CREATE TABLE ZVT_PARAMETR (
    id INT PRIMARY KEY,
    type VARCHAR(255),
    name VARCHAR(255),
    mark VARCHAR(255),
    icon_file BLOB
);

-- Table ZVT_LOCATION
CREATE TABLE ZVT_LOCATION (
    id INT PRIMARY KEY,
    mark VARCHAR(255),
    info VARCHAR(1000),
    place_id INT
);

-- Table ZVT_INDICATOR
CREATE TABLE ZVT_INDICATOR (
    id INT PRIMARY KEY,
    mark VARCHAR(255),
    info VARCHAR(1000)
);

-- Table ZVT_IOS
CREATE TABLE ZVT_IOS (
    id INT PRIMARY KEY,
    zvt_id INT REFERENCES ZVT(id),
    ios_signal_id INT REFERENCES IOS_SIGNAL(id)
);

-- Table IOS_SIGNAL_TYPE
CREATE TABLE IOS_SIGNAL_TYPE (
    id INT PRIMARY KEY,
    mark VARCHAR(255),
    info VARCHAR(1000)
);

-- Table IOS_SIGNAL
CREATE TABLE IOS_SIGNAL (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    description VARCHAR(1000),
    ios_signal_type_id INT REFERENCES IOS_SIGNAL_TYPE(id)
);

-- Table ZVT_UBDN
CREATE TABLE ZVT_UBDN (
    id INT PRIMARY KEY,
    zvt_id INT REFERENCES ZVT(id),
    ubdn_id INT REFERENCES UBDN_ELEMENT(id),
    place_id INT
);

-- Table ZVT_KV
CREATE TABLE ZVT_KV (
    id INT PRIMARY KEY,
    zvt_id INT REFERENCES ZVT(id),
    element_id INT REFERENCES ELEMENT(id)
);

-- Table REFERENCE_TYPE
CREATE TABLE REFERENCE_TYPE (
    id INT PRIMARY KEY,
    type VARCHAR(255)
);

-- Table REF_ELEMENT
CREATE TABLE REF_ELEMENT (
    id INT PRIMARY KEY,
    reference_type INT REFERENCES REFERENCE_TYPE(id),
    element_id INT REFERENCES ELEMENT(id),
    name VARCHAR(255),
    point_from FLOAT,
    point_to FLOAT,
    coordinate_x FLOAT,
    coordinate_y FLOAT,
    image_src VARCHAR(255),
    file_blob BLOB,
    date_update DATETIME,
    scheme_id INT REFERENCES SCHEME(id),
    album_id INT REFERENCES ALBUM(id),
    color_id INT REFERENCES SCHEME_COLORS(id)
);

-- Table SWITCHING_FORM
CREATE TABLE SWITCHING_FORM (
    id INT PRIMARY KEY,
    date_create DATETIME
);

-- Table SWITCHING_ELEMENTS
CREATE TABLE SWITCHING_ELEMENTS (
    id INT PRIMARY KEY,
    switching_id INT REFERENCES SWITCHING_FORM(id),
    element_id INT REFERENCES ELEMENT(id),
    status BOOLEAN,
    color_id INT REFERENCES SCHEME_COLORS(id)
);

-- Table WORK_ORDER
CREATE TABLE WORK_ORDER (
    id INT PRIMARY KEY,
    date_create DATETIME,
    status BOOLEAN,
    work_order_type_id INT REFERENCES WORK_ORDER_TYPE(id),
    work_order_actions_id INT REFERENCES WORK_ORDER_ACTIONS(id)
);

-- Table WORK_ORDER_TYPE
CREATE TABLE WORK_ORDER_TYPE (
    id INT PRIMARY KEY,
    type VARCHAR(255),
    color_id INT REFERENCES SCHEME_COLORS(id)
);

-- Table WORK_ORDER_ACTIONS
CREATE TABLE WORK_ORDER_ACTIONS (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    description VARCHAR(1000),
    element_color INT REFERENCES SCHEME_COLORS(id),
    text_element_color INT REFERENCES SCHEME_COLORS(id)
);

-- Table SCHEME_COLORS
CREATE TABLE SCHEME_COLORS (
    id INT PRIMARY KEY,
    color_code VARCHAR(255),
    color_text VARCHAR(255)
);